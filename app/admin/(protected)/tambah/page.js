import { ambilSemuaKategori } from '@/lib/data';
import ToggleStokUkuran from '@/components/ToggleStokUkuran';
import { tambahProdukAction } from './actions';

export const metadata = { title: 'Tambah Produk — Admin' };
export const dynamic = 'force-dynamic';

export default async function TambahProdukPage({ searchParams }) {
  const daftarKategori = await ambilSemuaKategori();
  const error = searchParams?.error || '';

  return (
    <>
      <h1>Tambah Produk Baru</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="form-standar" action={tambahProdukAction} encType="multipart/form-data">
        <label htmlFor="nama_produk">Nama Produk</label>
        <input type="text" id="nama_produk" name="nama_produk" required />

        <label htmlFor="kategori_id">Kategori</label>
        <select id="kategori_id" name="kategori_id" required defaultValue="">
          <option value="">-- Pilih Kategori --</option>
          {daftarKategori.map((kat) => (
            <option key={kat.id} value={kat.id}>
              {kat.nama_kategori}
            </option>
          ))}
        </select>

        <label htmlFor="deskripsi">Deskripsi</label>
        <textarea id="deskripsi" name="deskripsi"></textarea>

        <label htmlFor="harga">Harga (Rp)</label>
        <input type="number" id="harga" name="harga" min={0} step={1000} required />

        <ToggleStokUkuran />

        <label htmlFor="gambar">Gambar Produk (opsional)</label>
        <input type="file" id="gambar" name="gambar" accept=".jpg,.jpeg,.png,.webp" />

        <button type="submit" className="btn btn-emas" style={{ marginTop: 20 }}>
          Simpan Produk
        </button>
      </form>
    </>
  );
}
