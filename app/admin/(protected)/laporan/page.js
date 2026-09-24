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
  const bagian = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(tgl);

  const ambil = (tipe) => bagian.find((b) => b.type === tipe)?.value;
  const hari = ambil('day');
  const bulan = NAMA_BULAN[Number(ambil('month')) - 1];
  const tahun = ambil('year');
  const jam = ambil('hour');
  const menit = ambil('minute');

  return `${hari} ${bulan} ${tahun} • ${jam}:${menit}`;
}

const NAMA_BULAN_PANJANG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// '2026-09-17' -> '17 September 2026'
function formatTanggalPanjang(ymd) {
  const [th, bl, tg] = String(ymd).split('-').map(Number);
  if (!th || !bl || !tg) return ymd;
  return `${tg} ${NAMA_BULAN_PANJANG[bl - 1]} ${th}`;
}

export default async function LaporanPenjualanPage({ searchParams }) {
  const dari = searchParams?.dari || '';
  const sampai = searchParams?.sampai || '';
  const laporan = await ambilLaporanPenjualan({ dari: dari || null, sampai: sampai || null });

  const aman = (v) => v.replace(/[^0-9-]/g, '');
  const namaBerkas = `Laporan-Penjualan_${aman(dari) || 'awal'}_${aman(sampai) || 'akhir'}`;

  let periode = 'Semua tanggal';
  if (dari && sampai) periode = `${formatTanggalPanjang(dari)} s/d ${formatTanggalPanjang(sampai)}`;
  else if (dari) periode = `Sejak ${formatTanggalPanjang(dari)}`;
  else if (sampai) periode = `Sampai dengan ${formatTanggalPanjang(sampai)}`;

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
          <input type="date" id="dari" name="dari" defaultValue={dari} className="input-tanggal" />
        </div>
        <div>
          <label htmlFor="sampai" style={{ display: 'block', marginBottom: 4 }}>
            Sampai Tanggal
          </label>
          <input type="date" id="sampai" name="sampai" defaultValue={sampai} className="input-tanggal" />
        </div>
        <button type="submit" className="btn btn-emas">
          Tampilkan
        </button>
        {laporan.baris.length > 0 && (
          <span
            dangerouslySetInnerHTML={{
              __html:
                '<button type="button" class="btn btn-emas" onclick="document.getElementById(\'preview-struk\').showModal()">Cetak Laporan</button>',
            }}
          />
        )}
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

      {/* ===== Pratinjau & cetak laporan (format resmi) ===== */}
      <dialog id="preview-struk" className="dialog-struk dialog-laporan">
        <div
          className="dialog-aksi"
          dangerouslySetInnerHTML={{
            __html:
              '<button type="button" class="btn btn-emas" onclick="var t=document.title;document.title=\'' +
              namaBerkas +
              '\';window.print();document.title=t;">Cetak / Simpan PDF</button>' +
              '<button type="button" class="btn btn-garis-soga" onclick="document.getElementById(\'preview-struk\').close()">Tutup</button>',
          }}
        />

        <div className="laporan-cetak">
          <div className="laporan-kop">
            <div className="laporan-nama">BATIK NUSANTARA</div>
            <div className="laporan-judul">LAPORAN PENJUALAN</div>
            <div className="laporan-periode">Periode: {periode}</div>
          </div>

          <table className="laporan-ringkasan">
            <tbody>
              <tr>
                <td>Total Pendapatan</td>
                <td>:</td>
                <td>{formatRupiah(laporan.totalPendapatan)}</td>
              </tr>
              <tr>
                <td>Jumlah Transaksi</td>
                <td>:</td>
                <td>{laporan.totalTransaksi} transaksi</td>
              </tr>
              <tr>
                <td>Total Item Terjual</td>
                <td>:</td>
                <td>{laporan.totalItemTerjual} pcs</td>
              </tr>
            </tbody>
          </table>

          <table className="laporan-tabel">
            <thead>
              <tr>
                <th className="tengah">No</th>
                <th>Tanggal</th>
                <th>Kode Pesanan</th>
                <th>Produk</th>
                <th className="tengah">Jumlah</th>
                <th className="angka">Harga Satuan</th>
                <th className="angka">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {laporan.baris.map((b, i) => (
                <tr key={b.id}>
                  <td className="tengah">{i + 1}</td>
                  <td>{formatTanggal(b.tanggal)}</td>
                  <td>{b.kodePesanan}</td>
                  <td>{b.namaProduk}</td>
                  <td className="tengah">{b.jumlah}</td>
                  <td className="angka">{formatRupiah(b.harga)}</td>
                  <td className="angka">{formatRupiah(b.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="angka">
                  Total
                </td>
                <td className="tengah">{laporan.totalItemTerjual}</td>
                <td />
                <td className="angka">{formatRupiah(laporan.totalPendapatan)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="laporan-catatan">Dicetak pada: {formatTanggal(new Date().toISOString())}</div>
        </div>
      </dialog>
    </>
  );
}