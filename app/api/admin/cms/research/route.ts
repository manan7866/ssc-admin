import { NextRequest, NextResponse } from 'next/server';
import { proxyToMainApp, getCookieHeader } from '@/lib/api-proxy';
import { getAdminTokenFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = getAdminTokenFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const cookieHeader = getCookieHeader(req);
  const result = await proxyToMainApp('/api/admin/cms/research', {
    method: 'GET',
    cookie: cookieHeader,
  });

  return NextResponse.json(result.data, { status: result.status });
}

export async function POST(req: NextRequest) {
  const admin = getAdminTokenFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const cookieHeader = getCookieHeader(req);
  const body = await req.text();

  const result = await proxyToMainApp('/api/admin/cms/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    cookie: cookieHeader,
  });

  return NextResponse.json(result.data, { status: result.status });
}

export async function PATCH(req: NextRequest) {
  const admin = getAdminTokenFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const cookieHeader = getCookieHeader(req);
  const body = await req.text();

  const result = await proxyToMainApp('/api/admin/cms/research', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
    cookie: cookieHeader,
  });

  return NextResponse.json(result.data, { status: result.status });
}

export async function DELETE(req: NextRequest) {
  const admin = getAdminTokenFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const cookieHeader = getCookieHeader(req);
  const body = await req.text();

  const result = await proxyToMainApp('/api/admin/cms/research', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body,
    cookie: cookieHeader,
  });

  return NextResponse.json(result.data, { status: result.status });
}
