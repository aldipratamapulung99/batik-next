'use server';

import { redirect } from 'next/navigation';
import { ambilProdukById, ubahProduk, simpanStokUkuran, unggahGambarProduk } from '@/lib/data';

const EKSTENSI_DIIZINKAN = ['jpg', 'jpeg', 'png', 'webp'];

export async function ubahProdukAction(id, formData) {
  const produkLama = await ambilProdukById(id);
  if (!produkLama) redirect('/admin/dashboard');

  const kategoriId = parseInt(formData.get('kategori_id') || '0', 10);
  const namaProduk = (formData.get('nama_produk') || '').toString().trim();
  const deskripsi = (formData.get('deskripsi') || '').toString().trim();
  const harga = parseFloat(formData.get('harga') || '0');
  const pakaiUkuran = formData.get('pakai_ukuran') === 'on';
  const stok = pakaiUkuran ? produkLama.stok : parseInt(formData.get('stok') || '0', 10);

  let namaFile = produkLama.gambar; // pertahankan gambar lama jika tidak diganti

  const file = formData.get('gambar');
  if (file && typeof file === 'object' && file.size > 0) {
    const ekstensi = file.name.split('.').pop().toLowerCase();
    if (EKSTENSI_DIIZINKAN.includes(ekstensi)) {
      namaFile = await unggahGambarProduk(file);
    }
  }

  if (!namaProduk || kategoriId <= 0 || harga <= 0) {
    redirect(`/admin/edit/${id}?error=${encodeURIComponent('Nama produk, kategori, dan harga wajib diisi dengan benar.')}`);
  }

  await ubahProduk(id, {
    kategori_id: kategoriId,
    nama_produk: namaProduk,
    deskripsi,
    harga,
    stok,
    pakai_ukuran: pakaiUkuran,
    gambar: namaFile,
  });

  if (pakaiUkuran) {
    await simpanStokUkuran(id, {
      S: formData.get('stok_ukuran_S'),
      M: formData.get('stok_ukuran_M'),
      L: formData.get('stok_ukuran_L'),
      XL: formData.get('stok_ukuran_XL'),
      XXL: formData.get('stok_ukuran_XXL'),
    });
  }

  redirect('/admin/dashboard');
}
