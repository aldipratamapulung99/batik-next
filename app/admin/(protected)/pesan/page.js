import Link from 'next/link';
import { ambilSemuaPesan } from '@/lib/data';
import { formatRupiah } from '@/lib/helpers';
import { ubahStatusTransaksiAction } from './actions';

export const metadata = { title: 'Transaksi — Admin' };
export const dynamic = 'force-dynamic';

const NAMA_BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const DAFTAR_STATUS = ['Baru', 'Diproses', 'Selesai', 'Dibatalkan'];

function formatTanggal(iso) {
  const bagian = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso));

  const ambil = (tipe) => bagian.find((b) => b.type === tipe)?.value;
  const bulan = NAMA_BULAN[Number(ambil('month')) - 1];
  return `${ambil('day')} ${bulan} ${ambil('year')} ${ambil('hour')}:${ambil('minute')}`;
}

function buatLinkGmail(baris) {
  const subjekBalasan = 'Re: ' + (baris.subjek || 'Pesan Anda ke Batik Nusantara');
  const isiBalasan = `Halo ${baris.nama},\n\nTerima kasih sudah menghubungi Batik Nusantara.\n\n---\nPesan Anda sebelumnya:\n${baris.isi_pesan}`;
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: baris.email,
    su: subjekBalasan,
    body: isiBalasan,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function hargaSatuanBaris(baris) {
  if (baris.harga_satuan != null) return Number(baris.harga_satuan);
  return Number(baris.harga_produk || 0);
}

function kelasStatus(status) {
  return `badge-status badge-${String(status || 'Baru').toLowerCase()}`;
}

/** Kelompokkan baris `pesan` per kode pesanan: satu transaksi = satu grup (bisa berisi beberapa produk) */
function kelompokkan(daftarPesan) {
  const peta = new Map();
  for (const b of daftarPesan) {
    const kunci = b.kode_pesanan || `pesan-${b.id}`;
    const transaksi = !!b.produk_id;

    if (!peta.has(kunci)) {
      peta.set(kunci, {
        kunci,
        kunciAman: kunci.replace(/[^A-Za-z0-9-]/g, ''),
        kode: b.kode_pesanan || (transaksi ? `#${b.id}` : `Pesan #${b.id}`),
        transaksi,
        tanggal: b.dibuat_pada,
        nama: b.nama,
        email: b.email,
        alamat: b.alamat,
        catatan: b.isi_pesan,
        subjek: b.subjek,
        status: b.status,
        baris: [],
        item: [],
        ids: [],
        total: 0,
      });
    }

    const g = peta.get(kunci);
    g.baris.push(b);
    g.ids.push(b.id);

    if (transaksi) {
      const harga = hargaSatuanBaris(b);
      const jumlah = b.jumlah || 1;
      g.item.push({
        id: b.id,
        namaProduk: b.nama_produk || b.subjek,
        ukuran: b.ukuran,
        jumlah,
        harga,
        subtotal: harga * jumlah,
      });
      g.total += harga * jumlah;
    }
  }
  return Array.from(peta.values());
}

export default async function TransaksiPage({ searchParams }) {
  const kodeDipilih = searchParams?.kode || '';
  const filterStatus = DAFTAR_STATUS.includes(searchParams?.status) ? searchParams.status : '';

  const daftarPesan = await ambilSemuaPesan();
  const semuaGrup = kelompokkan(daftarPesan);

  /* ===================== HALAMAN DETAIL ===================== */
  if (kodeDipilih) {
    const g = semuaGrup.find((x) => x.kunci === kodeDipilih);

    if (!g) {
      return (
        <>
          <h1>Detail Transaksi</h1>
          <p>
            Transaksi tidak ditemukan. <Link href="/admin/pesan">Kembali ke daftar transaksi</Link>.
          </p>
        </>
      );
    }

    const ubahStatus = ubahStatusTransaksiAction.bind(null, g.ids);
    const totalPcs = g.item.reduce((t, it) => t + it.jumlah, 0);
    const opsiStatus = DAFTAR_STATUS.filter((s) => !(g.status === 'Selesai' && s === 'Dibatalkan'));
    const catatanTampil = g.catatan && !g.catatan.startsWith('Pesanan dari keranjang') ? g.catatan : '-';

    return (
      <>
        <h1>{g.transaksi ? 'Detail Transaksi' : 'Detail Pesan'}</h1>
        <p>
          <Link href="/admin/pesan">&larr; Kembali ke daftar transaksi</Link>
        </p>

        <div className="aksi-detail">
          {g.transaksi && (
            <span
              dangerouslySetInnerHTML={{
                __html: `<button type="button" class="btn btn-emas" onclick="document.getElementById('nota-${g.kunciAman}').showModal()">Cetak Transaksi</button>`,
              }}
            />
          )}
          <a
            className="btn btn-garis-soga"
            href={buatLinkGmail(g.baris[0])}
            target="_blank"
            rel="noopener noreferrer"
          >
            Balas via Gmail
          </a>
        </div>

        <div className="kartu-admin">
          <p className="baris-detail">
            <strong>{g.transaksi ? 'Kode Transaksi:' : 'Kode:'}</strong> {g.kode}
          </p>
          <p className="baris-detail">
            <strong>Tanggal:</strong> {formatTanggal(g.tanggal)}
          </p>
          <p className="baris-detail">
            <strong>Nama Penerima:</strong> {g.nama}
          </p>
          <p className="baris-detail">
            <strong>Email:</strong> {g.email}
          </p>
          {g.transaksi ? (
            <>
              <p className="baris-detail" style={{ whiteSpace: 'pre-line' }}>
                <strong>Alamat:</strong> {g.alamat || '-'}
              </p>
              <p className="baris-detail">
                <strong>Catatan:</strong> {catatanTampil}
              </p>
            </>
          ) : (
            <>
              <p className="baris-detail">
                <strong>Subjek:</strong> {g.subjek || '-'}
              </p>
              <p className="baris-detail" style={{ whiteSpace: 'pre-line' }}>
                <strong>Isi Pesan:</strong> {g.catatan}
              </p>
            </>
          )}

          <div className="blok-status">
            <span className="label-status">Status Pesanan</span>
            {g.status === 'Dibatalkan' ? (
              <span className={kelasStatus(g.status)}>{g.status}</span>
            ) : (
              <form action={ubahStatus} className="baris-status">
                <select name="status" defaultValue={g.status} className="pilih-status">
                  {opsiStatus.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn btn-emas">
                  Simpan Status
                </button>
              </form>
            )}
            {g.transaksi && g.status !== 'Dibatalkan' && (
              <small className="catatan-status">Mengubah status ke Dibatalkan akan mengembalikan stok produk.</small>
            )}
          </div>
        </div>

        {g.transaksi && (
          <div className="kartu-admin" style={{ overflowX: 'auto' }}>
            <table className="tabel-admin">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Ukuran</th>
                  <th>Harga</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {g.item.map((it) => (
                  <tr key={it.id}>
                    <td>{it.namaProduk}</td>
                    <td>{it.ukuran || '-'}</td>
                    <td>{formatRupiah(it.harga)}</td>
                    <td>{it.jumlah}</td>
                    <td>{formatRupiah(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="kolom-total-label">
                    Total
                  </td>
                  <td className="kolom-total-nilai">{formatRupiah(g.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* ===== Pratinjau & cetak struk ===== */}
        {g.transaksi && (
          <dialog id={`nota-${g.kunciAman}`} className="dialog-struk">
            <div
              className="dialog-aksi"
              dangerouslySetInnerHTML={{
                __html:
                  `<button type="button" class="btn btn-emas" onclick="var t=document.title;document.title='Nota-${g.kunciAman}';window.print();document.title=t;">Cetak / Simpan PDF</button>` +
                  `<button type="button" class="btn btn-garis-soga" onclick="document.getElementById('nota-${g.kunciAman}').close()">Tutup</button>`,
              }}
            />
            <div className="struk-cetak">
              <div className="tengah tebal">BATIK NUSANTARA</div>
              <div className="tengah">Nota Pesanan</div>
              <div className="garis" />

              <div className="baris">
                <span>Kode</span>
                <span className="tebal">{g.kode}</span>
              </div>
              <div className="baris">
                <span>Tanggal</span>
                <span>{formatTanggal(g.tanggal)}</span>
              </div>
              <div className="baris">
                <span>Status</span>
                <span>{g.status}</span>
              </div>
              <div className="garis" />

              <div className="tebal">{g.nama}</div>
              <div>{g.email}</div>
              <div className="struk-alamat">{g.alamat || '-'}</div>
              <div className="garis" />

              {g.item.map((it) => (
                <div key={it.id} className="struk-pesanan">
                  <div>
                    {it.namaProduk}
                    {it.ukuran ? ` (${it.ukuran})` : ''}
                  </div>
                  <div className="baris">
                    <span>
                      {it.jumlah} x {formatRupiah(it.harga)}
                    </span>
                    <span>{formatRupiah(it.subtotal)}</span>
                  </div>
                </div>
              ))}
              <div className="garis" />

              <div className="baris">
                <span>Jumlah Item</span>
                <span>{totalPcs} pcs</span>
              </div>
              <div className="baris tebal">
                <span>TOTAL</span>
                <span>{formatRupiah(g.total)}</span>
              </div>
              <div className="garis" />
              <div className="tengah">Terima kasih</div>
            </div>
          </dialog>
        )}
      </>
    );
  }

  /* ===================== DAFTAR TRANSAKSI ===================== */
  const grupTampil = filterStatus ? semuaGrup.filter((g) => g.status === filterStatus) : semuaGrup;

  return (
    <>
      <h1>Transaksi</h1>
      <p style={{ color: '#6b5b47' }}>Pantau dan proses pesanan pelanggan di sini.</p>

      <div className="filter-bar">
        <Link href="/admin/pesan" className={!filterStatus ? 'aktif' : ''}>
          Semua
        </Link>
        {DAFTAR_STATUS.map((s) => (
          <Link key={s} href={`/admin/pesan?status=${s}`} className={filterStatus === s ? 'aktif' : ''}>
            {s}
          </Link>
        ))}
      </div>

      {grupTampil.length === 0 ? (
        <p>Belum ada transaksi{filterStatus ? ` dengan status "${filterStatus}"` : ''}.</p>
      ) : (
        <div className="kartu-admin" style={{ overflowX: 'auto' }}>
          <table className="tabel-admin">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Tanggal</th>
                <th>Pelanggan</th>
                <th>Total</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {grupTampil.map((g) => (
                <tr key={g.kunci}>
                  <td>{g.kode}</td>
                  <td>{formatTanggal(g.tanggal)}</td>
                  <td>{g.nama}</td>
                  <td>{g.transaksi ? formatRupiah(g.total) : '-'}</td>
                  <td>
                    <span className={kelasStatus(g.status)}>{g.status}</span>
                  </td>
                  <td>
                    <Link href={`/admin/pesan?kode=${encodeURIComponent(g.kunci)}`} className="btn btn-garis-soga btn-kecil">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}