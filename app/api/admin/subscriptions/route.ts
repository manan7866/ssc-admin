import { NextRequest, NextResponse } from 'next/server';
import { proxyToMainApp, getCookieHeader } from '@/lib/api-proxy';
import { getAdminTokenFromRequest } from '@/lib/auth';

function checkFinanceAccess(req: NextRequest) {
  const admin = getAdminTokenFromRequest(req);
  if (!admin) return null;
  if (admin.role !== 'admin' && admin.role !== 'finance_handler') return null;
  return admin;
}

export async function GET(req: NextRequest) {
  if (!checkFinanceAccess(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const cookieHeader = getCookieHeader(req);
  const result = await proxyToMainApp('/api/admin/subscriptions', {
    method: 'GET',
    cookie: cookieHeader,
  });

  return NextResponse.json(result.data, { status: result.status });
}