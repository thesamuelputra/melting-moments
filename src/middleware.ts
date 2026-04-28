import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function getExpectedToken(): Promise<string | null> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null; // No password configured — block all access

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode('melting-moments-admin-session');
  
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b: number) => b.toString(16).padStart(2, '0')).join('');
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const expected = await getExpectedToken();
    // If no password is configured, block all admin access
    if (!expected) {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
    const token = request.cookies.get('admin_token')?.value;
    if (!token || token !== expected) {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
}
