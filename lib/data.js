import 'server-only';
import { supabaseServer } from './supabaseServer';
import { daftarUkuranBaku } from './helpers';

/** Mengambil semua kategori produk, urut abjad */
export async function ambilSemuaKategori() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('kategori')
    .select('*')
    .order('nama_kategori', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Mengambil daftar produk, opsional difilter berdasarkan kategori
 * dan/atau kata kunci pencarian. Meniru ambil_produk() di functions.php.
 */
export async function ambilProduk({ kategoriId = null, kataKunci = null, batas = null } = {}) {
  const supabase = supabaseServer();
  let query = supabase
    .from('produk')
    .select('*, kategori(nama_kategori)')
    .order('dibuat_pada', { ascending: false });

  if (kategoriId) query = query.eq('kategori_id', kategoriId);
  if (kataKunci) query = query.ilike('nama_produk', `%${kataKunci}%`);
  if (batas) query = query.limit(batas);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((p) => ({
    ...p,
    nama_kategori: p.kategori?.nama_kategori || '',
  }));
}

/** Mengambil satu produk berdasarkan ID */
export async function ambilProdukById(id) {
  if (!id || Number.isNaN(Number(id))) return null;
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('produk')
    .select('*, kategori(nama_kategori)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...data, nama_kategori: data.kategori?.nama_kategori || '' };
}

/**
 * Mengambil stok per ukuran untuk satu produk. Selalu mengembalikan
 * kelima ukuran baku (stok dianggap 0 kalau belum ada barisnya).
 */
export async function ambilStokUkuran(produkId) {
  const supabase = supabaseServer();
  const hasil = Object.fromEntries(daftarUkuranBaku().map((u) => [u, 0]));

  const { data, error } = await supabase
    .from('produk_ukuran')
    .select('ukuran, stok')
    .eq('produk_id', produkId);
  if (error) throw error;

  (data || []).forEach((baris) => {
    hasil[baris.ukuran] = baris.stok;
  });

  return hasil;
}

/** Menyimpan pesan dari form kontak (atau satu baris item checkout) ke database */
export async function simpanPesan({
  nama,
  email,
  subjek,
  isiPesan,
  ukuran = '',
  produkId = null,
  jumlah = 1,
  alamat = '',
  kodePesanan = null,
  hargaSatuan = null,
}) {
  const supabase = supabaseServer();
  const { error } = await supabase.from('pesan').insert({
    nama,
    email,
    alamat,
    subjek,
    isi_pesan: isiPesan,
    ukuran,
    produk_id: produkId,
    jumlah,
    kode_pesanan: kodePesanan,
    harga_satuan: hargaSatuan,
  });
  return !error;
}

/** Mengurangi stok produk (tanpa ukuran). false kalau stok tidak cukup. */
export async function kurangiStokProduk(produkId, jumlah) {
  const supabase = supabaseServer();
  const { data, error } = await supabase.rpc('kurangi_stok_produk', {
    p_produk_id: produkId,
    p_jumlah: jumlah,
  });
  if (error) throw error;
  return !!data;
}

/** Mengembalikan stok produk (tanpa ukuran) */
export async function kembalikanStokProduk(produkId, jumlah) {
  const supabase = supabaseServer();
  const { error } = await supabase.rpc('kembalikan_stok_produk', {
    p_produk_id: produkId,
    p_jumlah: jumlah,
  });
  if (error) throw error;
}

/** Mengurangi stok untuk ukuran tertentu. false kalau stok tidak cukup. */
export async function kurangiStokUkuran(produkId, ukuran, jumlah) {
  const supabase = supabaseServer();
  const { data, error } = await supabase.rpc('kurangi_stok_ukuran', {
    p_produk_id: produkId,
    p_ukuran: ukuran,
    p_jumlah: jumlah,
  });
  if (error) throw error;
  return !!data;
}

/** Mengembalikan stok untuk ukuran tertentu */
export async function kembalikanStokUkuran(produkId, ukuran, jumlah) {
  const supabase = supabaseServer();
  const { error } = await supabase.rpc('kembalikan_stok_ukuran', {
    p_produk_id: produkId,
    p_ukuran: ukuran,
    p_jumlah: jumlah,
  });
  if (error) throw error;
}

/**
 * Memproses checkout keranjang: mengurangi stok tiap item lebih dulu,
 * baru menyimpan satu baris `pesan` per item dengan kode_pesanan yang
 * sama supaya tercatat sebagai satu transaksi. Kalau stok salah satu
 * item tidak cukup, stok item lain yang sudah terlanjur dikurangi
 * dikembalikan lagi (biar tidak ada stok yang "nyangkut").
 */
export async function buatTransaksiKeranjang({ kodePesanan, nama, email, alamat, catatan, items }) {
  const berhasilDikurangi = [];

  for (const item of items) {
    const pakaiUkuran = !!item.ukuran;
    const cukup = pakaiUkuran
      ? await kurangiStokUkuran(item.produkId, item.ukuran, item.jumlah)
      : await kurangiStokProduk(item.produkId, item.jumlah);

    if (!cukup) {
      for (const dikembalikan of berhasilDikurangi) {
        if (dikembalikan.ukuran) {
          await kembalikanStokUkuran(dikembalikan.produkId, dikembalikan.ukuran, dikembalikan.jumlah);
        } else {
          await kembalikanStokProduk(dikembalikan.produkId, dikembalikan.jumlah);
        }
      }
      return {
        sukses: false,
        pesan: `Maaf, stok "${item.namaProduk}"${item.ukuran ? ` ukuran ${item.ukuran}` : ''} tidak mencukupi.`,
      };
    }

    berhasilDikurangi.push(item);
  }

  for (const item of items) {
    const sukses = await simpanPesan({
      nama,
      email,
      alamat,
      subjek: item.namaProduk,
      isiPesan: catatan || `Pesanan dari keranjang (${kodePesanan})`,
      ukuran: item.ukuran || '',
      produkId: item.produkId,
      jumlah: item.jumlah,
      kodePesanan,
      hargaSatuan: item.harga,
    });

    if (!sukses) {
      return { sukses: false, pesan: 'Terjadi kesalahan saat menyimpan pesanan, silakan coba lagi.' };
    }
  }

  return { sukses: true };
}

/** Kategori beserta jumlah produk yang memakainya (untuk halaman admin) */
export async function ambilKategoriDenganJumlahProduk() {
  const daftarKategori = await ambilSemuaKategori();
  const supabase = supabaseServer();

  const hasil = await Promise.all(
    daftarKategori.map(async (kat) => {
      const { count } = await supabase
        .from('produk')
        .select('id', { count: 'exact', head: true })
        .eq('kategori_id', kat.id);
      return { ...kat, jumlahProduk: count || 0 };
    })
  );

  return hasil;
}

/** Menambah kategori baru */
export async function tambahKategori(namaKategori) {
  const supabase = supabaseServer();
  const { error } = await supabase.from('kategori').insert({ nama_kategori: namaKategori });
  if (error) throw error;
}

/** Mengubah nama kategori */
export async function ubahKategori(id, namaKategori) {
  const supabase = supabaseServer();
  const { error } = await supabase.from('kategori').update({ nama_kategori: namaKategori }).eq('id', id);
  if (error) throw error;
}

/** Menghapus kategori. Ditolak (bukan dihapus paksa) kalau masih dipakai oleh produk. */
export async function hapusKategori(id) {
  const supabase = supabaseServer();

  const { count, error: errorHitung } = await supabase
    .from('produk')
    .select('id', { count: 'exact', head: true })
    .eq('kategori_id', id);
  if (errorHitung) throw errorHitung;

  if (count > 0) {
    return { sukses: false, pesan: `Kategori masih dipakai oleh ${count} produk, tidak bisa dihapus.` };
  }

  const { error } = await supabase.from('kategori').delete().eq('id', id);
  if (error) throw error;
  return { sukses: true };
}

/**
 * Laporan penjualan dari pesanan yang sudah "Selesai", opsional difilter
 * rentang tanggal (format 'YYYY-MM-DD'). Harga dihitung dari harga_satuan
 * (harga saat dipesan) supaya tetap akurat walau harga produk berubah;
 * untuk pesanan lama yang belum punya harga_satuan, dipakai harga produk saat ini.
 */
export async function ambilLaporanPenjualan({ dari = null, sampai = null } = {}) {
  const supabase = supabaseServer();
  let query = supabase
    .from('pesan')
    .select('*, produk(nama_produk, harga)')
    .eq('status', 'Selesai')
    .order('dibuat_pada', { ascending: false });

  if (dari) query = query.gte('dibuat_pada', dari);
  if (sampai) query = query.lte('dibuat_pada', `${sampai}T23:59:59`);

  const { data, error } = await query;
  if (error) throw error;

  const baris = (data || []).map((p) => {
    const harga = p.harga_satuan != null ? Number(p.harga_satuan) : Number(p.produk?.harga || 0);
    const jumlah = p.jumlah || 1;
    return {
      id: p.id,
      tanggal: p.dibuat_pada,
      kodePesanan: p.kode_pesanan || `#${p.id}`,
      namaProduk: p.produk?.nama_produk || p.subjek,
      jumlah,
      harga,
      subtotal: harga * jumlah,
    };
  });

  const totalPendapatan = baris.reduce((total, b) => total + b.subtotal, 0);
  const totalItemTerjual = baris.reduce((total, b) => total + b.jumlah, 0);
  const totalTransaksi = new Set(baris.map((b) => b.kodePesanan)).size;

  return { baris, totalPendapatan, totalItemTerjual, totalTransaksi };
}

/** Mengambil admin berdasarkan username (untuk proses login) */
export async function ambilAdminByUsername(username) {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('admin').select('*').eq('username', username).maybeSingle();
  if (error) throw error;
  return data;
}

/** Statistik ringkas untuk dashboard admin */
export async function ambilStatistikDashboard() {
  const supabase = supabaseServer();

  const [{ count: totalPesanBaru }, { count: totalPesanSelesai }, { count: totalPesanBatal }] = await Promise.all([
    supabase.from('pesan').select('id', { count: 'exact', head: true }).neq('status', 'Selesai'),
    supabase.from('pesan').select('id', { count: 'exact', head: true }).eq('status', 'Selesai'),
    supabase.from('pesan').select('id', { count: 'exact', head: true }).eq('status', 'Dibatalkan'),
  ]);

  return { totalPesanBaru, totalPesanSelesai, totalPesanBatal };
}

/** Mengambil semua pesan masuk beserta nama produk terkait, urut terbaru dulu */
export async function ambilSemuaPesan() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('pesan')
    .select('*, produk(nama_produk)')
    .order('dibuat_pada', { ascending: false });
  if (error) throw error;
  return (data || []).map((p) => ({ ...p, nama_produk: p.produk?.nama_produk || null }));
}

/** Mengambil satu pesan (dipakai saat ubah status, untuk cek data lama) */
export async function ambilPesanById(id) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('pesan')
    .select('*, produk(pakai_ukuran)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...data, pakai_ukuran: data.produk?.pakai_ukuran || false };
}

/** Mengubah status sebuah pesan */
export async function ubahStatusPesan(id, status) {
  const supabase = supabaseServer();
  const { error } = await supabase.from('pesan').update({ status }).eq('id', id);
  if (error) throw error;
}

/** Menambah produk baru */
export async function tambahProduk(produk) {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('produk').insert(produk).select().single();
  if (error) throw error;
  return data;
}

/** Mengubah data produk */
export async function ubahProduk(id, produk) {
  const supabase = supabaseServer();
  const { error } = await supabase.from('produk').update(produk).eq('id', id);
  if (error) throw error;
}

/** Menghapus produk */
export async function hapusProduk(id) {
  const supabase = supabaseServer();
  const { error } = await supabase.from('produk').delete().eq('id', id);
  if (error) throw error;
}

/** Menyimpan stok per ukuran dari form tambah/edit produk, lalu sinkron total stok */
export async function simpanStokUkuran(produkId, dataUkuran) {
  const supabase = supabaseServer();
  const { error } = await supabase.rpc('simpan_stok_ukuran', {
    p_produk_id: produkId,
    p_s: Number(dataUkuran.S) || 0,
    p_m: Number(dataUkuran.M) || 0,
    p_l: Number(dataUkuran.L) || 0,
    p_xl: Number(dataUkuran.XL) || 0,
    p_xxl: Number(dataUkuran.XXL) || 0,
  });
  if (error) throw error;
}

/** Upload gambar produk ke Supabase Storage, mengembalikan URL publiknya */
export async function unggahGambarProduk(file) {
  const supabase = supabaseServer();
  const ekstensi = file.name.split('.').pop().toLowerCase();
  const namaFile = `produk_${Date.now()}_${Math.floor(Math.random() * 900 + 100)}.${ekstensi}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from('produk-images')
    .upload(namaFile, arrayBuffer, { contentType: file.type, upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from('produk-images').getPublicUrl(namaFile);
  return data.publicUrl;
}
