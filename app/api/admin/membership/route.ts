import { NextRequest, NextResponse } from 'next/server';
import { proxyToMainApp, getCookieHeader } from '@/lib/api-proxy';

export async function GET(req: NextRequest) {
  const cookieHeader = getCookieHeader(req);
  console.log('[membership GET] Cookies:', cookieHeader ? 'present' : 'missing');
  
  const result = await proxyToMainApp('/api/admin/membership', {
    method: 'GET',
    cookie: cookieHeader,
  });

  console.log('[membership GET] Response:', result.status, result.data ? 'has data' : 'no data');

  return NextResponse.json(result.data, { status: result.status });
}

export async function PATCH(req: NextRequest) {
  const cookieHeader = getCookieHeader(req);
  const body = await req.text();
  
  const result = await proxyToMainApp('/api/admin/membership', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
    cookie: cookieHeader,
  });

  return NextResponse.json(result.data, { status: result.status });
}
