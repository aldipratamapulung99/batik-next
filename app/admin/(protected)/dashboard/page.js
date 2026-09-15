import Link from 'next/link';
import { ambilProduk, ambilStatistikDashboard } from '@/lib/data';
import { formatRupiah, urlGambar } from '@/lib/helpers';

export const metadata = { title: 'Dashboard — Admin' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [daftarProduk, statistik] = await Promise.all([ambilProduk({}), ambilStatistikDashboard()]);

  const totalProduk = daftarProduk.length;
  const totalStok = daftarProduk.reduce((total, p) => total + (p.stok || 0), 0);

  return (
    <>
      <h1>Dashboard Produk</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
        <div style={{ background: 'var(--putih)', padding: '20px 28px', borderRadius: 6 }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--indigo-dark)' }}>{totalProduk}</div>
          <div style={{ color: '#6b5b47' }}>Total Produk</div>
        </div>
        <div style={{ background: 'var(--putih)', padding: '20px 28px', borderRadius: 6 }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--indigo-dark)' }}>{totalStok}</div>
          <div style={{ color: '#6b5b47' }}>Total Stok (pcs)</div>
        </div>
        <Link href="/admin/pesan" style={{ background: 'var(--putih)', padding: '20px 28px', borderRadius: 6, textDecoration: 'none', display: 'block' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--indigo-dark)' }}>{statistik.totalPesanBaru}</div>
          <div style={{ color: '#6b5b47' }}>Pesan Masuk</div>
        </Link>
        <Link href="/admin/pesan" style={{ background: 'var(--putih)', padding: '20px 28px', borderRadius: 6, textDecoration: 'none', display: 'block' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#3E8E4F' }}>{statistik.totalPesanSelesai}</div>
          <div style={{ color: '#6b5b47' }}>Pesanan Selesai</div>
        </Link>
        <Link href="/admin/pesan" style={{ background: 'var(--putih)', padding: '20px 28px', borderRadius: 6, textDecoration: 'none', display: 'block' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#a33' }}>{statistik.totalPesanBatal}</div>
          <div style={{ color: '#6b5b47' }}>Dibatalkan</div>
        </Link>
      </div>

      <table className="tabel-admin">
        <thead>
          <tr>
            <th>Gambar</th>
            <th>Nama Produk</th>
            <th>Kategori</th>
            <th>Harga</th>
            <th>Stok</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {daftarProduk.map((produk) => (
            <tr key={produk.id}>
              <td>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={urlGambar(produk.gambar)} alt={produk.nama_produk} />
              </td>
              <td>{produk.nama_produk}</td>
              <td>{produk.nama_kategori}</td>
              <td>{formatRupiah(produk.harga)}</td>
              <td>{produk.stok}</td>
              <td>
                <Link className="aksi-link" href={`/admin/edit/${produk.id}`}>
                  Edit
                </Link>
                <a className="aksi-link hapus-link" href={`/admin/hapus/${produk.id}`} style={{ color: '#a33' }}>
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
  if (a && !confirm('Yakin hapus produk ini?')) e.preventDefault();
});`,
      }}
    />
  );
}
