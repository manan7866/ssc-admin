import { NextRequest, NextResponse } from 'next/server';
import { proxyToMainApp, getCookieHeader } from '@/lib/api-proxy';

export async function GET(req: NextRequest) {
  const cookieHeader = getCookieHeader(req);
  console.log('[dashboard] Cookie header:', cookieHeader ? 'present' : 'missing');
  console.log('[dashboard] Proxying to main app...');
  
  const result = await proxyToMainApp('/api/admin/dashboard', {
    method: 'GET',
    cookie: cookieHeader,
  });

  console.log('[dashboard] Main app response:', result.status, result.data ? 'has data' : 'no data');
  
  return NextResponse.json(result.data, { status: result.status });
}
