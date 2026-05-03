import { NextRequest, NextResponse } from 'next/server';
import { proxyToMainApp, getCookieHeader } from '@/lib/api-proxy';

export async function GET(req: NextRequest) {
  const result = await proxyToMainApp('/api/admin/contact-submissions', {
    method: 'GET',
    cookie: getCookieHeader(req),
  });
  return NextResponse.json(result.data, { status: result.status });
}

export async function PATCH(req: NextRequest) {
  const body = await req.text();
  const result = await proxyToMainApp('/api/admin/contact-submissions', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
    cookie: getCookieHeader(req),
  });
  return NextResponse.json(result.data, { status: result.status });
}
