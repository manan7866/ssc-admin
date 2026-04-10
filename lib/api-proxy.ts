/**
 * API Proxy Helper
 * Forwards requests to the main SSC app running on localhost:3010
 */

const MAIN_APP_URL = process.env.MAIN_APP_URL || 'http://localhost:3010';

export async function proxyToMainApp(
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string | null;
    cookie?: string | null;
  } = {}
) {
  const { method = 'GET', headers = {}, body = null, cookie = null } = options;

  const fetchHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (cookie) {
    // Extract only admin_token, not all cookies
    const adminTokenMatch = cookie.match(/admin_token=([^;]+)/);
    if (adminTokenMatch) {
      fetchHeaders['Cookie'] = `admin_token=${adminTokenMatch[1]}`;
      console.log(`[proxy] Using admin_token from cookies`);
    } else {
      console.log(`[proxy] No admin_token found in cookies, sending all: ${cookie.substring(0, 50)}...`);
      fetchHeaders['Cookie'] = cookie;
    }
  }

  const url = `${process.env.MAIN_APP_URL || 'http://localhost:3000'}${path}`;
  console.log(`[proxy] Forwarding ${method} ${path} to ${url}`);

  try {
    const response = await fetch(url, {
      method,
      headers: fetchHeaders,
      body,
    });

    const data = await response.json().catch(() => null);

    return {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      data,
    };
  } catch (error) {
    console.error(`[proxyToMainApp] Error fetching ${url}:`, error);
    return {
      status: 502,
      statusText: 'Bad Gateway',
      ok: false,
      headers: {},
      data: { error: 'Failed to reach main application server' },
    };
  }
}

export function getCookieHeader(req: import('next/server').NextRequest): string | null {
  return req.headers.get('cookie');
}

export { MAIN_APP_URL };
