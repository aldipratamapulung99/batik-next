import { ambilSemuaPesan } from '@/lib/data';
import TombolKonfirmasi from '@/components/TombolKonfirmasi';
import { ubahStatusPesanAction } from './actions';

export const metadata = { title: 'Pesan Masuk — Admin' };
export const dynamic = 'force-dynamic';

function formatTanggal(iso) {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

export default async function PesanMasukPage() {
  const daftarPesan = await ambilSemuaPesan();

  return (
    <>
      <h1>Pesan Masuk</h1>

      <table className="tabel-admin">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Kode Pesanan</th>
            <th>Nama</th>
            <th>Email</th>
            <th>Alamat</th>
            <th>Subjek</th>
            <th>Produk Dipesan</th>
            <th>Ukuran</th>
            <th>Isi Pesan</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {daftarPesan.map((baris) => {
            const tandaiDiproses = ubahStatusPesanAction.bind(null, baris.id, 'Diproses');
            const tandaiSelesai = ubahStatusPesanAction.bind(null, baris.id, 'Selesai');
            const batalkan = ubahStatusPesanAction.bind(null, baris.id, 'Dibatalkan');

            return (
              <tr key={baris.id}>
                <td>{formatTanggal(baris.dibuat_pada)}</td>
                <td>{baris.kode_pesanan || '-'}</td>
                <td>{baris.nama}</td>
                <td>{baris.email}</td>
                <td style={{ whiteSpace: 'pre-line' }}>{baris.alamat || '-'}</td>
                <td>{baris.subjek}</td>
                <td>{baris.nama_produk ? `${baris.nama_produk} (${baris.jumlah} pcs)` : '-'}</td>
                <td>{baris.ukuran || '-'}</td>
                <td>{baris.isi_pesan}</td>
                <td>{baris.status}</td>
                <td style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <a
                    className="btn btn-emas"
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    href={buatLinkGmail(baris)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Balas via Gmail
                  </a>

                  {baris.produk_id && (
                    <>
                      {baris.status !== 'Diproses' && baris.status !== 'Dibatalkan' && (
                        <form action={tandaiDiproses}>
                          <button className="btn btn-diproses" style={{ padding: '6px 14px', fontSize: '0.8rem' }} type="submit">
                            Tandai Diproses
                          </button>
                        </form>
                      )}
                      {baris.status !== 'Selesai' && baris.status !== 'Dibatalkan' && (
                        <form action={tandaiSelesai}>
                          <button className="btn btn-selesai" style={{ padding: '6px 14px', fontSize: '0.8rem' }} type="submit">
                            Tandai Selesai
                          </button>
                        </form>
                      )}
                      {baris.status !== 'Selesai' && baris.status !== 'Dibatalkan' && (
                        <form action={batalkan}>
                          <TombolKonfirmasi
                            pesanKonfirmasi="Batalkan pesanan ini? Stok produk akan dikembalikan."
                            className="btn btn-batal"
                            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                          >
                            Batalkan
                          </TombolKonfirmasi>
                        </form>
                      )}
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}