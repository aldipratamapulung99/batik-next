import { ambilProdukById, ambilSemuaKategori, ambilStokUkuran } from '@/lib/data';
import { urlGambar } from '@/lib/helpers';
import ToggleStokUkuran from '@/components/ToggleStokUkuran';
import { ubahProdukAction } from './actions';

export const metadata = { title: 'Edit Produk — Admin' };
export const dynamic = 'force-dynamic';

export default async function EditProdukPage({ params, searchParams }) {
  const id = parseInt(params.id, 10);
  const produk = await ambilProdukById(id);

  if (!produk) {
    return <p>Produk tidak ditemukan.</p>;
  }

  const [daftarKategori, stokUkuran] = await Promise.all([ambilSemuaKategori(), ambilStokUkuran(id)]);
  const error = searchParams?.error || '';
  const ubahDenganId = ubahProdukAction.bind(null, id);

  return (
    <>
      <h1>Edit Produk</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="form-standar" action={ubahDenganId} encType="multipart/form-data">
        <label htmlFor="nama_produk">Nama Produk</label>
        <input type="text" id="nama_produk" name="nama_produk" required defaultValue={produk.nama_produk} />

        <label htmlFor="kategori_id">Kategori</label>
        <select id="kategori_id" name="kategori_id" required defaultValue={produk.kategori_id}>
          {daftarKategori.map((kat) => (
            <option key={kat.id} value={kat.id}>
              {kat.nama_kategori}
            </option>
          ))}
        </select>

        <label htmlFor="deskripsi">Deskripsi</label>
        <textarea id="deskripsi" name="deskripsi" defaultValue={produk.deskripsi}></textarea>

        <label htmlFor="harga">Harga (Rp)</label>
        <input type="number" id="harga" name="harga" min={0} step={1000} required defaultValue={produk.harga} />

        <ToggleStokUkuran pakaiUkuranAwal={produk.pakai_ukuran} stokAwal={produk.stok} stokUkuranAwal={stokUkuran} />

        <p style={{ marginTop: 16 }}>Gambar saat ini:</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={urlGambar(produk.gambar)} alt={produk.nama_produk} style={{ width: 100, borderRadius: 4 }} />

        <label htmlFor="gambar">Ganti Gambar (opsional)</label>
        <input type="file" id="gambar" name="gambar" accept=".jpg,.jpeg,.png,.webp" />

        <button type="submit" className="btn btn-emas" style={{ marginTop: 20 }}>
          Simpan Perubahan
        </button>
      </form>
    </>
  );
}
