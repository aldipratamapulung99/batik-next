import Link from 'next/link';
import { ambilProduk, ambilStatistikDashboard, ambilLaporanPenjualan } from '@/lib/data';
import { formatRupiah, urlGambar } from '@/lib/helpers';

export const metadata = { title: 'Dashboard — Admin' };
export const dynamic = 'force-dynamic';

const JUMLAH_HARI = 14;
const JUMLAH_PRODUK_TERATAS = 8;

/** Kunci tanggal 'YYYY-MM-DD' menurut zona waktu Jakarta */
function kunciHari(tanggal) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(tanggal);
}

/** 1500000 -> 1,5jt ; 336000 -> 336rb */
function singkatRupiah(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '').replace('.', ',')}jt`;
  if (n >= 1000) return `${Math.round(n / 1000)}rb`;
  return String(n);
}

/** Batas atas sumbu Y yang "bulat" supaya garis bantu rapi */
function batasAtasBulat(maks) {
  const besaran = 10 ** Math.floor(Math.log10(Math.max(maks, 1)));
  return ([1, 2, 2.5, 5, 10].find((m) => m * besaran >= maks) || 10) * besaran;
}

export default async function DashboardPage({ searchParams }) {
  const [daftarProduk, statistik, laporan] = await Promise.all([
    ambilProduk({}),
    ambilStatistikDashboard(),
    ambilLaporanPenjualan({}),
  ]);

  // ---- Data grafik 1: pendapatan per hari (pesanan berstatus Selesai) ----
  const sekarang = Date.now();
  const hariList = [];
  for (let i = JUMLAH_HARI - 1; i >= 0; i--) hariList.push(kunciHari(new Date(sekarang - i * 86400000)));
  const totalPerHari = Object.fromEntries(hariList.map((k) => [k, 0]));
  for (const b of laporan.baris) {
    const k = kunciHari(new Date(b.tanggal));
    if (k in totalPerHari) totalPerHari[k] += b.subtotal;
  }
  const dataHari = hariList.map((k) => ({
    kunci: k,
    label: `${k.slice(8)}/${Number(k.slice(5, 7))}`,
    nilai: totalPerHari[k],
  }));
  const totalPeriode = dataHari.reduce((t, d) => t + d.nilai, 0);

  const LEBAR = 700;
  const TINGGI = 280;
  const KIRI = 56;
  const KANAN = 12;
  const ATAS = 22;
  const BAWAH = 36;
  const lebarPlot = LEBAR - KIRI - KANAN;
  const tinggiPlot = TINGGI - ATAS - BAWAH;
  const batasY = batasAtasBulat(Math.max(...dataHari.map((d) => d.nilai), 1));
  const lebarSlot = lebarPlot / dataHari.length;
  const lebarBatang = Math.min(30, lebarSlot * 0.65);
  const garisBantu = [0, 1, 2, 3, 4].map((i) => (batasY / 4) * i);

  // ---- Data grafik 2: penjualan per produk (baju) ----
  const petaProduk = new Map();
  for (const b of laporan.baris) {
    const cur = petaProduk.get(b.namaProduk) || { nama: b.namaProduk, jumlah: 0, pendapatan: 0 };
    cur.jumlah += b.jumlah;
    cur.pendapatan += b.subtotal;
    petaProduk.set(b.namaProduk, cur);
  }
  const produkTerlaris = Array.from(petaProduk.values())
    .sort((a, b) => b.jumlah - a.jumlah)
    .slice(0, JUMLAH_PRODUK_TERATAS);
  const jumlahTerbanyak = Math.max(...produkTerlaris.map((p) => p.jumlah), 1);

  const totalProduk = daftarProduk.length;
  const totalStok = daftarProduk.reduce((total, p) => total + (p.stok || 0), 0);

  return (
    <>
      <h1>Dashboard Produk</h1>

      {searchParams?.error && <div className="alert alert-error">{searchParams.error}</div>}

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

      {/* ===== Grafik penjualan ===== */}
      <div className="kartu-admin">
        <h3>Grafik Penjualan</h3>
        <p className="keterangan-grafik">
          Pendapatan per hari, {JUMLAH_HARI} hari terakhir (pesanan berstatus Selesai) &middot; Total{' '}
          <strong>{formatRupiah(totalPeriode)}</strong>
        </p>

        {totalPeriode === 0 ? (
          <p>Belum ada penjualan selesai dalam {JUMLAH_HARI} hari terakhir.</p>
        ) : (
          <svg
            className="grafik-svg"
            viewBox={`0 0 ${LEBAR} ${TINGGI}`}
            role="img"
            aria-label="Grafik pendapatan per hari"
          >
            {garisBantu.map((nilai) => {
              const y = ATAS + tinggiPlot - (nilai / batasY) * tinggiPlot;
              return (
                <g key={nilai}>
                  <line className="grafik-garis" x1={KIRI} x2={LEBAR - KANAN} y1={y} y2={y} />
                  <text className="grafik-sumbu-teks" x={KIRI - 8} y={y + 4} textAnchor="end">
                    {singkatRupiah(nilai)}
                  </text>
                </g>
              );
            })}

            {dataHari.map((d, i) => {
              const tinggi = (d.nilai / batasY) * tinggiPlot;
              const x = KIRI + i * lebarSlot + (lebarSlot - lebarBatang) / 2;
              const y = ATAS + tinggiPlot - tinggi;
              return (
                <g key={d.kunci}>
                  {d.nilai > 0 && (
                    <>
                      <rect className="grafik-batang" x={x} y={y} width={lebarBatang} height={tinggi} rx="3">
                        <title>{`${d.label}: ${formatRupiah(d.nilai)}`}</title>
                      </rect>
                      <text className="grafik-nilai" x={x + lebarBatang / 2} y={y - 6} textAnchor="middle">
                        {singkatRupiah(d.nilai)}
                      </text>
                    </>
                  )}
                  <text
                    className="grafik-sumbu-teks"
                    x={x + lebarBatang / 2}
                    y={TINGGI - BAWAH + 18}
                    textAnchor="middle"
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      <div className="kartu-admin">
        <h3>Penjualan per Baju</h3>
        <p className="keterangan-grafik">
          {JUMLAH_PRODUK_TERATAS} produk terlaris berdasarkan jumlah terjual (pesanan berstatus Selesai)
        </p>

        {produkTerlaris.length === 0 ? (
          <p>Belum ada penjualan selesai.</p>
        ) : (
          <div className="daftar-bar">
            {produkTerlaris.map((p) => (
              <div key={p.nama} className="bar-baris">
                <span className="bar-label" title={p.nama}>
                  {p.nama}
                </span>
                <div className="bar-track">
                  <div className="bar-isi" style={{ width: `${(p.jumlah / jumlahTerbanyak) * 100}%` }} />
                </div>
                <span className="bar-nilai">
                  {p.jumlah} pcs &middot; {formatRupiah(p.pendapatan)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <h3>Daftar Produk</h3>
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