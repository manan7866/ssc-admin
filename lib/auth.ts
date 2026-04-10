import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'ssc-jwt-secret-2026-change-this';

export interface AdminTokenPayload {
  adminId: string;
  email: string;
  role: string;
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

export function getAdminTokenFromRequest(req: NextRequest): AdminTokenPayload | null {
  const token = req.cookies.get('admin_token')?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function getCookieHeader(req: NextRequest): string | null {
  return req.headers.get('cookie');
}

/**
 * Verifies admin session by calling the main app's session verification endpoint
 */
export async function verifySessionWithMainApp(cookieHeader: string | null): Promise<boolean> {
  if (!cookieHeader) return false;

  const mainAppUrl = process.env.MAIN_APP_URL || 'http://localhost:3010';
  try {
    const response = await fetch(`${mainAppUrl}/api/admin/dashboard`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
