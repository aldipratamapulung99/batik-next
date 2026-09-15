import { NextResponse } from 'next/server';
import { hapusKategori } from '@/lib/data';

export async function GET(request, { params }) {
  const id = parseInt(params.id, 10);
  let pesanError = '';

  if (id > 0) {
    const hasil = await hapusKategori(id);
    if (!hasil.sukses) pesanError = hasil.pesan;
  }

  const url = new URL('/admin/kategori', request.url);
  if (pesanError) url.searchParams.set('error', pesanError);
  return NextResponse.redirect(url);
}
