import { NextRequest, NextResponse } from 'next/server';
import { proxyToMainApp, getCookieHeader } from '@/lib/api-proxy';

export async function GET(req: NextRequest) {
  const cookieHeader = getCookieHeader(req);
  const result = await proxyToMainApp('/api/admin/support', {
    method: 'GET',
    cookie: cookieHeader,
  });

  return NextResponse.json(result.data, { status: result.status });
}

export async function POST(req: NextRequest) {
  const cookieHeader = getCookieHeader(req);
  const body = await req.text();

  const result = await proxyToMainApp('/api/admin/support', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    cookie: cookieHeader,
  });

  return NextResponse.json(result.data, { status: result.status });
}

export async function PATCH(req: NextRequest) {
  const cookieHeader = getCookieHeader(req);
  const body = await req.text();

  const result = await proxyToMainApp('/api/admin/support', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
    cookie: cookieHeader,
  });

  return NextResponse.json(result.data, { status: result.status });
}
