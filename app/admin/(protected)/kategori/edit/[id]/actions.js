'use server';

import { redirect } from 'next/navigation';
import { ubahKategori } from '@/lib/data';

export async function ubahKategoriAction(id, formData) {
  const nama = (formData.get('nama_kategori') || '').toString().trim();

  if (!nama) {
    redirect(`/admin/kategori/edit/${id}?error=${encodeURIComponent('Nama kategori wajib diisi.')}`);
  }

  await ubahKategori(id, nama);
  redirect('/admin/kategori');
}
