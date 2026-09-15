// Pengganti fungsi-fungsi bantu murni dari includes/functions.php (yang tidak
// menyentuh database langsung -- fungsi yang query DB dipindah ke lib/data.js).

/** Mengubah angka menjadi format Rupiah, mis. 150000 -> Rp150.000 */
export function formatRupiah(angka) {
  const n = Number(angka) || 0;
  return 'Rp' + n.toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

/** Daftar ukuran baku yang dipakai produk berukuran (baju, dll) */
export function daftarUkuranBaku() {
  return ['S', 'M', 'L', 'XL', 'XXL'];
}

/** Kategori yang tidak memakai pilihan ukuran S/M/L/XL/XXL */
export function kategoriTanpaUkuran() {
  return ['Kain Batik', 'Aksesoris Batik'];
}

/** Mengembalikan URL gambar produk yang valid, fallback ke placeholder */
export function urlGambar(gambar) {
  if (!gambar) return '/placeholder-batik.svg';
  // Gambar hasil upload admin (disimpan di Supabase Storage) berupa URL penuh.
  if (gambar.startsWith('http://') || gambar.startsWith('https://')) return gambar;
  // Gambar bawaan/seed disimpan sebagai file statis di /public/img.
  return `/img/${gambar}`;
}

/** Membuat kode pesanan singkat & unik untuk satu transaksi checkout, mis. ORD-7F3K2Q */
export function buatKodePesanan() {
  const acak = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${acak}`;
}
