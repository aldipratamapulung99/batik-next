import { NextResponse } from 'next/server';
import { hapusProduk } from '@/lib/data';

export async function GET(request, { params }) {
  const id = parseInt(params.id, 10);
  let pesanError = '';

  if (id > 0) {
    try {
      const hasil = await hapusProduk(id);
      if (!hasil.sukses) pesanError = hasil.pesan;
    } catch (e) {
      pesanError = `Gagal menghapus produk: ${e?.message || 'terjadi kesalahan'}`;
    }
  }

  const url = new URL('/admin/dashboard', request.url);
  if (pesanError) url.searchParams.set('error', pesanError);
  return NextResponse.redirect(url);
}