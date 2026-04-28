'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

// Generate a signed token from the password to prevent cookie guessing
function generateToken(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error('ADMIN_PASSWORD is not configured.');
  return crypto.createHmac('sha256', secret).update('melting-moments-admin-session').digest('hex');
}

export async function login(formData: FormData) {
  const password = formData.get('password');
  const cookieStore = await cookies();
  
  if (password === process.env.ADMIN_PASSWORD) {
    const token = generateToken();
    cookieStore.set('admin_token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    redirect('/admin');
  }
  
  return { error: 'Invalid password' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  redirect('/admin-login');
}
