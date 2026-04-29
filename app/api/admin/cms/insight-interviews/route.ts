import { NextRequest, NextResponse } from 'next/server';
import { proxyToMainApp, getCookieHeader } from '@/lib/api-proxy';

const API_PATH = '/api/admin/cms/insight-interviews';

export async function GET(req: NextRequest) {
  const cookie = getCookieHeader(req);
  
  // Forward params as-is (now includes 'for' param)
  const url = `${API_PATH}${req.nextUrl.search}`;
  const result = await proxyToMainApp(url, { method: 'GET', cookie });
  
  if (!result.ok) {
    return NextResponse.json(result.data || { error: 'Error' }, { status: result.status });
  }
  return NextResponse.json(result.data);
}

export async function POST(req: NextRequest) {
  const cookie = getCookieHeader(req);
  const body = await req.text();
  const result = await proxyToMainApp(API_PATH, { method: 'POST', cookie, body });
  
  if (!result.ok) {
    return NextResponse.json(result.data || { error: 'Error' }, { status: result.status });
  }
  return NextResponse.json(result.data);
}

export async function PATCH(req: NextRequest) {
  const cookie = getCookieHeader(req);
  const body = await req.text();
  const result = await proxyToMainApp(API_PATH, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, cookie, body });
  
  if (!result.ok) {
    return NextResponse.json(result.data || { error: 'Error' }, { status: result.status });
  }
  return NextResponse.json(result.data);
}

export async function DELETE(req: NextRequest) {
  const cookie = getCookieHeader(req);
  const body = await req.text();
  const result = await proxyToMainApp(API_PATH, { method: 'DELETE', cookie, body });
  
  if (!result.ok) {
    return NextResponse.json(result.data || { error: 'Error' }, { status: result.status });
  }
  return NextResponse.json(result.data);
}
