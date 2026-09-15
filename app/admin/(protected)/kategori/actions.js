'use server';

import { redirect } from 'next/navigation';
import { tambahKategori } from '@/lib/data';

export async function tambahKategoriAction(formData) {
  const nama = (formData.get('nama_kategori') || '').toString().trim();

  if (!nama) {
    redirect(`/admin/kategori?error=${encodeURIComponent('Nama kategori wajib diisi.')}`);
  }

  await tambahKategori(nama);
  redirect('/admin/kategori');
}
