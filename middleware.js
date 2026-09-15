import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, verifikasiTokenSesi } from '@/lib/session';

export const config = {
  matcher: ['/admin/:path*'],
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Halaman login sendiri tidak boleh ikut diproteksi, kalau tidak akan loop redirect.
  if (pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const sesi = await verifikasiTokenSesi(token);

  if (!sesi) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
