import { ambilSemuaKategori } from '@/lib/data';
import { ubahKategoriAction } from './actions';

export const metadata = { title: 'Edit Kategori — Admin' };
export const dynamic = 'force-dynamic';

export default async function EditKategoriPage({ params, searchParams }) {
  const id = parseInt(params.id, 10);
  const daftarKategori = await ambilSemuaKategori();
  const kategori = daftarKategori.find((k) => k.id === id);
  const error = searchParams?.error || '';

  if (!kategori) {
    return <p>Kategori tidak ditemukan.</p>;
  }

  const ubahDenganId = ubahKategoriAction.bind(null, id);

  return (
    <>
      <h1>Edit Kategori</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="form-standar" action={ubahDenganId}>
        <label htmlFor="nama_kategori">Nama Kategori</label>
        <input type="text" id="nama_kategori" name="nama_kategori" required defaultValue={kategori.nama_kategori} />

        <button type="submit" className="btn btn-emas" style={{ marginTop: 20 }}>
          Simpan Perubahan
        </button>
      </form>
    </>
  );
}
