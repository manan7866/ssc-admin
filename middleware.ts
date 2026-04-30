import { NextRequest, NextResponse } from 'next/server';

function decodeJWT(token: string): { role: string; permissions?: string[] } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    return { role: payload.role, permissions: payload.permissions || [] };
  } catch {
    return null;
  }
}

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3050';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/admin/login' || pathname === '/admin/unauthorized') {
    return NextResponse.next();
  }

  const token = req.cookies.get('admin_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', ADMIN_URL));
  }

  const payload = decodeJWT(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/admin/login', ADMIN_URL));
  }

  if (pathname === '/admin' || pathname === '/admin/') {
    if (payload.role !== 'admin') {
      const roleRedirects: Record<string, string> = {
        application_handler: '/admin/membership',
        finance_handler: '/admin/donations',
        cms_handler: '/admin/cms/saints',
      };
      const redirectPath = roleRedirects[payload.role] || '/admin/membership';
      return NextResponse.redirect(new URL(redirectPath, ADMIN_URL));
    }
  }

  if (payload.role === 'application_handler') {
    const allowedPages = ['membership', 'volunteer', 'mentorship', 'collaboration', 'conference', 'conference-event'];
    const pageMap: Record<string, string> = {
      '/admin/membership': 'membership',
      '/admin/volunteer': 'volunteer',
      '/admin/mentorship': 'mentorship',
      '/admin/collaboration': 'collaboration',
      '/admin/conference': 'conference',
      '/admin/conference-event': 'conference-event',
    };

    for (const [prefix, perm] of Object.entries(pageMap)) {
      if (pathname.startsWith(prefix) && !allowedPages.includes(perm)) {
        return NextResponse.redirect(new URL('/admin/unauthorized', ADMIN_URL));
      }
      if (pathname.startsWith(prefix) && !payload.permissions?.includes(perm)) {
        return NextResponse.redirect(new URL('/admin/unauthorized', ADMIN_URL));
      }
    }

    const allowedPrefixes = ['/admin/membership', '/admin/volunteer', '/admin/mentorship', '/admin/collaboration', '/admin/conference', '/admin/conference-event', '/admin'];
    const isAllowed = allowedPrefixes.some(p => pathname === p || pathname.startsWith(p));
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/admin/unauthorized', ADMIN_URL));
    }
  }

  if (payload.role === 'finance_handler') {
    const allowedPaths = ['/admin/donations', '/admin/subscriptions'];
    const isAllowed = allowedPaths.some(p => pathname === p || pathname.startsWith(p));
    if (!isAllowed && pathname !== '/admin') {
      return NextResponse.redirect(new URL('/admin/unauthorized', ADMIN_URL));
    }
  }

  if (payload.role === 'cms_handler') {
    if (!pathname.startsWith('/admin/cms') && pathname !== '/admin') {
      return NextResponse.redirect(new URL('/admin/unauthorized', ADMIN_URL));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
