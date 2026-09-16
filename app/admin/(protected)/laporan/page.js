import { ambilLaporanPenjualan } from '@/lib/data';
import { formatRupiah } from '@/lib/helpers';

export const metadata = { title: 'Laporan Penjualan — Admin' };
export const dynamic = 'force-dynamic';

const NAMA_BULAN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

function formatTanggal(iso) {
  const tgl = new Date(iso);
  const hari = String(tgl.getDate()).padStart(2, '0');
  const bulan = NAMA_BULAN[tgl.getMonth()];
  const tahun = tgl.getFullYear();
  const jam = String(tgl.getHours()).padStart(2, '0');
  const menit = String(tgl.getMinutes()).padStart(2, '0');
  return `${hari} ${bulan} ${tahun} • ${jam}:${menit}`;
}

export default async function LaporanPenjualanPage({ searchParams }) {
  const dari = searchParams?.dari || '';
  const sampai = searchParams?.sampai || '';
  const laporan = await ambilLaporanPenjualan({ dari: dari || null, sampai: sampai || null });

  return (
    <>
      <h1>Laporan Penjualan</h1>

      <form
        method="GET"
        style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 24 }}
      >
        <div>
          <label htmlFor="dari" style={{ display: 'block', marginBottom: 4 }}>
            Dari Tanggal
          </label>
          <input type="date" id="dari" name="dari" defaultValue={dari} />
        </div>
        <div>
          <label htmlFor="sampai" style={{ display: 'block', marginBottom: 4 }}>
            Sampai Tanggal
          </label>
          <input type="date" id="sampai" name="sampai" defaultValue={sampai} />
        </div>
        <button type="submit" className="btn btn-emas">
          Tampilkan
        </button>
      </form>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
        <div style={{ background: 'var(--putih)', padding: '20px 28px', borderRadius: 6 }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--indigo-dark)' }}>
            {formatRupiah(laporan.totalPendapatan)}
          </div>
          <div style={{ color: '#6b5b47' }}>Total Pendapatan</div>
        </div>
        <div style={{ background: 'var(--putih)', padding: '20px 28px', borderRadius: 6 }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--indigo-dark)' }}>
            {laporan.totalTransaksi}
          </div>
          <div style={{ color: '#6b5b47' }}>Transaksi Selesai</div>
        </div>
        <div style={{ background: 'var(--putih)', padding: '20px 28px', borderRadius: 6 }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--indigo-dark)' }}>
            {laporan.totalItemTerjual}
          </div>
          <div style={{ color: '#6b5b47' }}>Item Terjual (pcs)</div>
        </div>
      </div>

      {laporan.baris.length === 0 ? (
        <p>Belum ada transaksi berstatus &quot;Selesai&quot; pada rentang tanggal ini.</p>
      ) : (
        <table className="tabel-admin">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Kode Pesanan</th>
              <th>Produk</th>
              <th>Jumlah</th>
              <th>Harga Satuan</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {laporan.baris.map((b) => (
              <tr key={b.id}>
                <td>{formatTanggal(b.tanggal)}</td>
                <td>{b.kodePesanan}</td>
                <td>{b.namaProduk}</td>
                <td>{b.jumlah}</td>
                <td>{formatRupiah(b.harga)}</td>
                <td>{formatRupiah(b.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}