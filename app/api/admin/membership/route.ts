import { NextRequest, NextResponse } from 'next/server';
import { proxyToMainApp, getCookieHeader } from '@/lib/api-proxy';
import { getAdminTokenFromRequest } from '@/lib/auth';

function checkAppAccess(req: NextRequest, page: string) {
  const admin = getAdminTokenFromRequest(req);
  if (!admin) return false;
  if (admin.role === 'admin') return true;
  if (admin.role === 'application_handler' && admin.permissions?.includes(page)) return true;
  return false;
}

export async function GET(req: NextRequest) {
  if (!checkAppAccess(req, 'membership')) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  
  const cookieHeader = getCookieHeader(req);
  const result = await proxyToMainApp('/api/admin/membership', {
    method: 'GET',
    cookie: cookieHeader,
  });

  return NextResponse.json(result.data, { status: result.status });
}

export async function PATCH(req: NextRequest) {
  if (!checkAppAccess(req, 'membership')) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
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
