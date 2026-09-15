import { NextResponse } from 'next/server';
import { hapusProduk } from '@/lib/data';

export async function GET(request, { params }) {
  const id = parseInt(params.id, 10);
  if (id > 0) {
    await hapusProduk(id);
  }
  return NextResponse.redirect(new URL('/admin/dashboard', request.url));
}
