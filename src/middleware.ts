import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function getExpectedToken(): Promise<string> {
  const secret = process.env.ADMIN_PASSWORD || 'default-secret';
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode('melting-moments-admin-session');
  
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const expected = await getExpectedToken();
    if (token !== expected) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
