'use server';

import { revalidatePath } from 'next/cache';
import { buatTransaksiKeranjang } from '@/lib/data';
import { buatKodePesanan } from '@/lib/helpers';

export async function prosesCheckout({ nama, email, alamat, catatan, items }) {
  nama = (nama || '').toString().trim();
  email = (email || '').toString().trim();
  alamat = (alamat || '').toString().trim();
  catatan = (catatan || '').toString().trim();

  if (!nama || !email || !alamat) {
    return { sukses: false, pesan: 'Nama, email, dan alamat pengiriman wajib diisi.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { sukses: false, pesan: 'Format email tidak valid.' };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { sukses: false, pesan: 'Keranjang kosong.' };
  }

  const kodePesanan = buatKodePesanan();
  const hasil = await buatTransaksiKeranjang({ kodePesanan, nama, email, alamat, catatan, items });

  if (!hasil.sukses) {
    return { sukses: false, pesan: hasil.pesan };
  }

  revalidatePath('/admin/laporan');
  revalidatePath('/admin/pesan');
  revalidatePath('/admin/dashboard');

  return { sukses: true, kodePesanan };
}