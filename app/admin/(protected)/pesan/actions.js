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