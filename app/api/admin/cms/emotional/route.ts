import { NextRequest, NextResponse } from 'next/server';
import { proxyToMainApp, getCookieHeader } from '@/lib/api-proxy';

export async function GET(req: NextRequest) {
  const cookie = getCookieHeader(req);
  const url = `/api/admin/cms/emotional${req.nextUrl.search}`;
  const result = await proxyToMainApp(url, { method: 'GET', cookie });
  
  if (!result.ok) {
    return NextResponse.json(result.data || { error: 'Error' }, { status: result.status });
  }
  return NextResponse.json(result.data);
}

export async function POST(req: NextRequest) {
  const cookie = getCookieHeader(req);
  const body = await req.text();
  const result = await proxyToMainApp('/api/admin/cms/emotional', { method: 'POST', cookie, body });
  
  if (!result.ok) {
    return NextResponse.json(result.data || { error: 'Error' }, { status: result.status });
  }
  return NextResponse.json(result.data);
}

export async function PATCH(req: NextRequest) {
  const cookie = getCookieHeader(req);
  const body = await req.text();
  const result = await proxyToMainApp('/api/admin/cms/emotional', { method: 'PATCH', cookie, body });
  
  if (!result.ok) {
    return NextResponse.json(result.data || { error: 'Error' }, { status: result.status });
  }
  return NextResponse.json(result.data);
}

export async function DELETE(req: NextRequest) {
  const cookie = getCookieHeader(req);
  const body = await req.text();
  const result = await proxyToMainApp('/api/admin/cms/emotional', { method: 'DELETE', cookie, body });
  
  if (!result.ok) {
    return NextResponse.json(result.data || { error: 'Error' }, { status: result.status });
  }
  return NextResponse.json(result.data);
}
