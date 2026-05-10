import { NextRequest, NextResponse } from 'next/server';
import { proxyToMainApp, getCookieHeader } from '@/lib/api-proxy';

export async function GET(req: NextRequest) {
  const cookie = getCookieHeader(req);
  const url = `/api/admin/cms/wazifa${req.nextUrl.search}`;
  const result = await proxyToMainApp(url, { method: 'GET', cookie });
  return NextResponse.json(result.data, { status: result.status });
}

export async function PATCH(req: NextRequest) {
  const cookie = getCookieHeader(req);
  const body = await req.text();
  const result = await proxyToMainApp('/api/admin/cms/wazifa', { method: 'PATCH', cookie, body });
  return NextResponse.json(result.data, { status: result.status });
}
