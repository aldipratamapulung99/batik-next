'use server';

import { revalidatePath } from 'next/cache';
import { ambilPesanById, ubahStatusPesan, kembalikanStokProduk, kembalikanStokUkuran } from '@/lib/data';

const STATUS_VALID = ['Baru', 'Diproses', 'Selesai', 'Dibatalkan'];

export async function ubahStatusPesanAction(id, status) {
  if (!(id > 0) || !STATUS_VALID.includes(status)) return;

  const pesanLama = await ambilPesanById(id);
  if (!pesanLama) return;

  // Kembalikan stok hanya kalau pesanan baru dibatalkan (belum pernah dibatalkan) dan terkait produk
  if (status === 'Dibatalkan' && pesanLama.status !== 'Dibatalkan' && pesanLama.produk_id) {
    if (pesanLama.pakai_ukuran && pesanLama.ukuran) {
      await kembalikanStokUkuran(pesanLama.produk_id, pesanLama.ukuran, pesanLama.jumlah);
    } else {
      await kembalikanStokProduk(pesanLama.produk_id, pesanLama.jumlah);
    }
  }

  await ubahStatusPesan(id, status);
  revalidatePath('/admin/pesan');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/laporan');
}

/**
 * Mengubah status satu transaksi (semua baris dengan kode pesanan yang sama sekaligus).
 * Aturan sama seperti sebelumnya: pesanan yang sudah Dibatalkan tidak bisa diubah lagi,
 * dan pesanan yang sudah Selesai tidak bisa dibatalkan.
 */
export async function ubahStatusTransaksiAction(ids, formData) {
  const status = (formData.get('status') || '').toString();
  if (!Array.isArray(ids) || !STATUS_VALID.includes(status)) return;

  for (const id of ids) {
    const lama = await ambilPesanById(id);
    if (!lama) continue;
    if (lama.status === 'Dibatalkan') continue;
    if (status === 'Dibatalkan' && lama.status === 'Selesai') continue;
    await ubahStatusPesanAction(id, status);
  }
}