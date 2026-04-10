import { NextRequest, NextResponse } from 'next/server';
import { proxyToMainApp, getCookieHeader } from '@/lib/api-proxy';

export async function POST(req: NextRequest) {
  const cookieHeader = getCookieHeader(req);
  const body = await req.text();
  
  const result = await proxyToMainApp('/api/admin/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    cookie: cookieHeader,
  });

  return NextResponse.json(result.data, { status: result.status });
}

export async function DELETE(req: NextRequest) {
  const cookieHeader = getCookieHeader(req);
  
  const result = await proxyToMainApp('/api/admin/session', {
    method: 'DELETE',
    cookie: cookieHeader,
  });

  // Clear the admin_token cookie
  const res = NextResponse.json(result.data, { status: result.status });
  res.headers.set('Set-Cookie', 'admin_token=; Path=/; Max-Age=0');
  return res;
}
