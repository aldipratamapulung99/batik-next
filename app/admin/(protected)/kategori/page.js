import Link from 'next/link';
import { ambilKategoriDenganJumlahProduk } from '@/lib/data';
import { tambahKategoriAction } from './actions';

export const metadata = { title: 'Kategori — Admin' };
export const dynamic = 'force-dynamic';

export default async function KategoriPage({ searchParams }) {
  const daftarKategori = await ambilKategoriDenganJumlahProduk();
  const error = searchParams?.error || '';

  return (
    <>
      <h1>Kategori Produk</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form
        className="form-standar"
        action={tambahKategoriAction}
        style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 28 }}
      >
        <div style={{ flex: 1 }}>
          <label htmlFor="nama_kategori">Kategori Baru</label>
          <input type="text" id="nama_kategori" name="nama_kategori" placeholder="mis. Kain Batik" required />
        </div>
        <button type="submit" className="btn btn-emas">
          Tambah
        </button>
      </form>

      <table className="tabel-admin">
        <thead>
          <tr>
            <th>Nama Kategori</th>
            <th>Jumlah Produk</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {daftarKategori.map((kat) => (
            <tr key={kat.id}>
              <td>{kat.nama_kategori}</td>
              <td>{kat.jumlahProduk}</td>
              <td>
                <Link className="aksi-link" href={`/admin/kategori/edit/${kat.id}`}>
                  Edit
                </Link>
                <a className="aksi-link hapus-link" href={`/admin/hapus-kategori/${kat.id}`} style={{ color: '#a33' }}>
                  Hapus
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ScriptKonfirmasiHapus />
    </>
  );
}

function ScriptKonfirmasiHapus() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
document.addEventListener('click', function (e) {
  var a = e.target.closest('.hapus-link');
  if (a && !confirm('Yakin hapus kategori ini?')) e.preventDefault();
});`,
      }}
    />
  );
}
