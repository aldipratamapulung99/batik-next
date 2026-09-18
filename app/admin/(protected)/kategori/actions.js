'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { tambahKategori } from '@/lib/data';

export async function tambahKategoriAction(formData) {
  const nama = (formData.get('nama_kategori') || '').toString().trim();

  if (!nama) {
    redirect(`/admin/kategori?error=${encodeURIComponent('Nama kategori wajib diisi.')}`);
  }

  await tambahKategori(nama);

  revalidatePath('/admin/kategori');
  revalidatePath('/admin/tambah');
  revalidatePath('/produk');

  redirect('/admin/kategori');
}