'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  ambilProdukById,
  simpanPesan,
  kurangiStokProduk,
  kembalikanStokProduk,
  kurangiStokUkuran,
  kembalikanStokUkuran,
} from '@/lib/data';
import { buatKodePesanan } from '@/lib/helpers';

const UKURAN_VALID = ['S', 'M', 'L', 'XL', 'XXL', 'Custom / Sebutkan di pesan'];

export async function kirimPesan(formData) {
  const nama = (formData.get('nama') || '').toString().trim();
  const email = (formData.get('email') || '').toString().trim();
  const alamat = (formData.get('alamat') || '').toString().trim();
  const subjek = (formData.get('subjek') || '').toString().trim();
  const ukuran = (formData.get('ukuran') || '').toString().trim();
  const isiPesan = (formData.get('isi_pesan') || '').toString().trim();
  const produkId = parseInt(formData.get('produk_id') || '0', 10) || 0;
  let jumlah = parseInt(formData.get('jumlah') || '1', 10);
  if (!jumlah || jumlah < 1) jumlah = 1;

  const produkTerpilih = produkId > 0 ? await ambilProdukById(produkId) : null;
  const pakaiUkuran = !!(produkTerpilih && produkTerpilih.pakai_ukuran);

  const paramsBalik = new URLSearchParams();
  if (produkId > 0) paramsBalik.set('produk_id', String(produkId));
  if (ukuran) paramsBalik.set('ukuran', ukuran);

  function gagal(pesan) {
    paramsBalik.set('status', 'error');
    paramsBalik.set('pesan', pesan);
    redirect(`/kontak?${paramsBalik.toString()}`);
  }

  if (!nama || !email || !isiPesan) {
    gagal('Nama, email, dan pesan wajib diisi.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    gagal('Format email tidak valid.');
  }
  if (produkId > 0 && !alamat) {
    gagal('Alamat pengiriman wajib diisi saat memesan produk.');
  }
  if (pakaiUkuran && !UKURAN_VALID.includes(ukuran)) {
    gagal('Silakan pilih ukuran terlebih dahulu dari halaman produk.');
  }

  if (pakaiUkuran) {
    const cukup = await kurangiStokUkuran(produkId, ukuran, jumlah);
    if (!cukup) gagal(`Maaf, stok ukuran ${ukuran} tidak mencukupi untuk jumlah yang diminta.`);
  } else if (produkId > 0) {
    const cukup = await kurangiStokProduk(produkId, jumlah);
    if (!cukup) gagal('Maaf, stok produk tidak mencukupi untuk jumlah yang diminta.');
  }

  const kodePesanan = produkId > 0 ? buatKodePesanan() : null;

  const sukses = await simpanPesan({
    nama,
    email,
    subjek,
    isiPesan,
    ukuran,
    produkId: produkId > 0 ? produkId : null,
    jumlah,
    alamat,
    kodePesanan,
    hargaSatuan: produkTerpilih ? produkTerpilih.harga : null,
  });

  if (!sukses) {
    if (produkId > 0) {
      if (pakaiUkuran) await kembalikanStokUkuran(produkId, ukuran, jumlah);
      else await kembalikanStokProduk(produkId, jumlah);
    }
    gagal('Terjadi kesalahan, silakan coba lagi.');
  }

  revalidatePath('/admin/laporan');
  revalidatePath('/admin/pesan');
  revalidatePath('/admin/dashboard');

  paramsBalik.set('status', 'sukses');
  paramsBalik.set('pesan', 'Terima kasih, pesan Anda sudah kami terima. Kami akan membalas melalui email secepatnya.');
  redirect(`/kontak?${paramsBalik.toString()}`);
}