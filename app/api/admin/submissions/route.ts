import { NextRequest, NextResponse } from 'next/server';
import { proxyToMainApp, getCookieHeader } from '@/lib/api-proxy';
import { getAdminTokenFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = getAdminTokenFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const cookieHeader = getCookieHeader(req);
  const url = `/api/admin/submissions${req.nextUrl.search}`;
  const result = await proxyToMainApp(url, { method: 'GET', cookie: cookieHeader });
  return NextResponse.json(result.data, { status: result.status });
}

export async function PATCH(req: NextRequest) {
  const admin = getAdminTokenFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const cookieHeader = getCookieHeader(req);
  const body = await req.json();
  const result = await proxyToMainApp('/api/admin/submissions', {
    method: 'PATCH',
    cookie: cookieHeader,
    body: JSON.stringify(body),
  });
  return NextResponse.json(result.data, { status: result.status });
}
