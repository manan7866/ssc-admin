import { NextRequest, NextResponse } from 'next/server';

const MAIN_APP_URL = process.env.MAIN_APP_URL || 'http://localhost:3000';
const SAFE_REDIRECT_RE = /^\/admin(\/[a-zA-Z0-9\-_/]*)?$/;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = formData.get('password') as string;
    const redirectPath = (formData.get('redirect') as string) || '/admin';

    if (!email || !password) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('error', 'Invalid credentials.');
      return NextResponse.redirect(loginUrl);
    }

    console.log('[login-form] Attempting login for:', email);
    console.log('[login-form] Forwarding to main app at:', `${MAIN_APP_URL}/api/admin/session`);

    // Forward login request to main app's session endpoint which returns a token
    let response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      response = await fetch(`${MAIN_APP_URL}/api/admin/session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, redirect: redirectPath }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (fetchError) {
      console.error('[login-form] Fetch error:', fetchError);
      const loginUrl = new URL('/admin/login', req.url);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        loginUrl.searchParams.set('error', 'Main app timeout. Is the main app running on ' + MAIN_APP_URL + '?');
      } else {
        loginUrl.searchParams.set('error', `Cannot connect to main app: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      }
      return NextResponse.redirect(loginUrl);
    }

    console.log('[login-form] Main app response status:', response.status);

    const data = await response.json();
    console.log('[login-form] Main app response:', data);

    if (!response.ok) {
      console.error('[login-form] Login failed:', data.error);
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('error', data.error || 'Invalid email or password.');
      return NextResponse.redirect(loginUrl);
    }

    // Main app returns token in response
    const token = data.token;
    if (!token) {
      console.error('[login-form] No token in response');
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('error', 'Invalid email or password.');
      return NextResponse.redirect(loginUrl);
    }

    const safeRedirect = SAFE_REDIRECT_RE.test(redirectPath) ? redirectPath : '/admin';

    console.log('[login-form] Login successful, redirecting to:', safeRedirect);
    console.log('[login-form] Token length:', token.length);

    // Set cookie and redirect
    const res = NextResponse.redirect(new URL(safeRedirect, req.url));
    const cookieValue = `admin_token=${token}; Path=/; Max-Age=86400; SameSite=Strict`;
    console.log('[login-form] Setting cookie:', cookieValue.substring(0, 50) + '...');
    res.headers.set('Set-Cookie', cookieValue);
    console.log('[login-form] Set-Cookie header set:', res.headers.getSetCookie ? res.headers.getSetCookie() : res.headers.get('Set-Cookie'));
    return res;
  } catch (error) {
    console.error('[login-form] Error:', error);
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('error', `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return NextResponse.redirect(loginUrl);
  }
}
