import { NextRequest, NextResponse } from 'next/server';
import { proxyToMainApp, getCookieHeader } from '@/lib/api-proxy';

export async function GET(req: NextRequest) {
  const cookieHeader = getCookieHeader(req);
  console.log('[users GET] === INCOMING REQUEST ===');
  console.log('[users GET] All cookies:', cookieHeader || 'NONE');
  console.log('[users GET] Request URL:', req.url);
  console.log('[users GET] Request method:', req.method);
  
  const result = await proxyToMainApp('/api/admin/users', {
    method: 'GET',
    cookie: cookieHeader,
  });

  console.log('[users GET] === MAIN APP RESPONSE ===');
  console.log('[users GET] Status:', result.status);
  console.log('[users GET] Data:', JSON.stringify(result.data).substring(0, 150));

  return NextResponse.json(result.data, { status: result.status });
}

export async function PATCH(req: NextRequest) {
  const cookieHeader = getCookieHeader(req);
  const body = await req.text();

  const result = await proxyToMainApp('/api/admin/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
    cookie: cookieHeader,
  });

  return NextResponse.json(result.data, { status: result.status });
}
