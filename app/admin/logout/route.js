import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from '@/lib/session';

export async function POST(request) {
  cookies().delete(ADMIN_COOKIE_NAME);
  return NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 });
}