import { NextRequest, NextResponse } from 'next/server';
import { proxyToMainApp, getCookieHeader } from '@/lib/api-proxy';
import { getAdminTokenFromRequest } from '@/lib/auth';

function checkCmsAccess(req: NextRequest) {
  const admin = getAdminTokenFromRequest(req);
  if (!admin) return null;
  if (admin.role !== 'admin' && admin.role !== 'cms_handler') return null;
  return admin;
}

export async function GET(req: NextRequest) {
  if (!checkCmsAccess(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const cookieHeader = getCookieHeader(req);
  const url = `/api/admin/cms/saints${req.nextUrl.search}`;
  const result = await proxyToMainApp(url, {
    method: 'GET',
    cookie: cookieHeader,
  });

  return NextResponse.json(result.data, { status: result.status });
}

export async function POST(req: NextRequest) {
  if (!checkCmsAccess(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const cookieHeader = getCookieHeader(req);
  const body = await req.text();

  const result = await proxyToMainApp('/api/admin/cms/saints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    cookie: cookieHeader,
  });

  return NextResponse.json(result.data, { status: result.status });
}

export async function PATCH(req: NextRequest) {
  if (!checkCmsAccess(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const cookieHeader = getCookieHeader(req);
  const body = await req.text();

  const result = await proxyToMainApp('/api/admin/cms/saints', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
    cookie: cookieHeader,
  });

  return NextResponse.json(result.data, { status: result.status });
}

export async function DELETE(req: NextRequest) {
  if (!checkCmsAccess(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const cookieHeader = getCookieHeader(req);
  const body = await req.text();

  const result = await proxyToMainApp('/api/admin/cms/saints', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body,
    cookie: cookieHeader,
  });

  return NextResponse.json(result.data, { status: result.status });
}
