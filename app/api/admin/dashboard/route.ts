import { NextRequest, NextResponse } from 'next/server';
import { proxyToMainApp, getCookieHeader } from '@/lib/api-proxy';

export async function GET(req: NextRequest) {
  const cookieHeader = getCookieHeader(req);
  console.log('[dashboard] Cookie header:', cookieHeader);
  console.log('[dashboard] Proxying to main app...');
  
  const result = await proxyToMainApp('/api/admin/dashboard', {
    method: 'GET',
    cookie: cookieHeader,
  });

  console.log('[dashboard] Main app response status:', result.status);
  console.log('[dashboard] Main app response data:', result.data);
  
  return NextResponse.json(result.data, { status: result.status });
}
