'use server';

import { redirect } from 'next/navigation';
import { tambahProduk, simpanStokUkuran, unggahGambarProduk } from '@/lib/data';

const EKSTENSI_DIIZINKAN = ['jpg', 'jpeg', 'png', 'webp'];

export async function tambahProdukAction(formData) {
  const kategoriId = parseInt(formData.get('kategori_id') || '0', 10);
  const namaProduk = (formData.get('nama_produk') || '').toString().trim();
  const deskripsi = (formData.get('deskripsi') || '').toString().trim();
  const harga = parseFloat(formData.get('harga') || '0');
  const pakaiUkuran = formData.get('pakai_ukuran') === 'on';
  const stok = pakaiUkuran ? 0 : parseInt(formData.get('stok') || '0', 10);

  let namaFile = 'placeholder-batik.svg';
  let error = '';

  const file = formData.get('gambar');
  if (file && typeof file === 'object' && file.size > 0) {
    const ekstensi = file.name.split('.').pop().toLowerCase();
    if (EKSTENSI_DIIZINKAN.includes(ekstensi)) {
      namaFile = await unggahGambarProduk(file);
    } else {
      error = 'Format gambar harus jpg, jpeg, png, atau webp.';
    }
  }

  if (!error && (!namaProduk || kategoriId <= 0 || harga <= 0)) {
    error = 'Nama produk, kategori, dan harga wajib diisi dengan benar.';
  }

  if (error) {
    redirect(`/admin/tambah?error=${encodeURIComponent(error)}`);
  }

  const produkBaru = await tambahProduk({
    kategori_id: kategoriId,
    nama_produk: namaProduk,
    deskripsi,
    harga,
    stok,
    pakai_ukuran: pakaiUkuran,
    gambar: namaFile,
  });

  if (pakaiUkuran) {
    await simpanStokUkuran(produkBaru.id, {
      S: formData.get('stok_ukuran_S'),
      M: formData.get('stok_ukuran_M'),
      L: formData.get('stok_ukuran_L'),
      XL: formData.get('stok_ukuran_XL'),
      XXL: formData.get('stok_ukuran_XXL'),
    });
  }

  redirect('/admin/dashboard');
}
