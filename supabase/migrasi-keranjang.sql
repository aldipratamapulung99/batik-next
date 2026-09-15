-- =====================================================================
-- Migrasi: dukungan Keranjang Belanja & Checkout
-- Jalankan sekali di Supabase SQL Editor (aman untuk database yang
-- sudah berisi data -- tidak menghapus atau mengubah data lama).
--
-- kode_pesanan  -> menandai beberapa baris `pesan` yang berasal dari
--                  satu proses checkout (satu kode = satu transaksi/
--                  keranjang berisi banyak produk).
-- harga_satuan  -> menyimpan harga produk saat dipesan, supaya laporan
--                  penjualan tetap akurat walau harga produk diubah
--                  admin di kemudian hari.
-- =====================================================================

alter table pesan add column if not exists kode_pesanan varchar(20);
alter table pesan add column if not exists harga_satuan numeric(12,2);

create index if not exists idx_pesan_kode_pesanan on pesan(kode_pesanan);
