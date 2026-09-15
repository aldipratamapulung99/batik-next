import Link from 'next/link';
import KartuProduk from '@/components/KartuProduk';
import PemilihUkuran from '@/components/PemilihUkuran';
import TombolTambahKeranjangPolos from '@/components/TombolTambahKeranjangPolos';
import { ambilProdukById, ambilProduk, ambilStokUkuran } from '@/lib/data';
import { formatRupiah, urlGambar, kategoriTanpaUkuran } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export default async function DetailProdukPage({ params }) {
  const produk = await ambilProdukById(params.id);

  if (!produk) {
    return (
      <div className="container" style={{ padding: '64px 0' }}>
        <p>
          Produk tidak ditemukan. <Link href="/produk">Kembali ke daftar produk</Link>.
        </p>
      </div>
    );
  }

  const produkTerkaitSemua = await ambilProduk({ kategoriId: produk.kategori_id, batas: 4 });
  const produkTerkait = produkTerkaitSemua.filter((p) => p.id !== produk.id);

  const pakaiUkuran = produk.pakai_ukuran && !kategoriTanpaUkuran().includes(produk.nama_kategori);
  const stokUkuran = pakaiUkuran ? await ambilStokUkuran(produk.id) : null;

  const hrefDasar = `/kontak?produk_id=${produk.id}&produk=${encodeURIComponent(produk.nama_produk)}`;

  return (
    <>
      <section>
        <div className="container">
          <p>
            <Link href="/produk">&larr; Kembali ke Produk</Link>
          </p>

          <div className="detail-produk" style={{ marginTop: 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={urlGambar(produk.gambar)} alt={produk.nama_produk} />

            <div>
              <span className="kategori-label">{produk.nama_kategori}</span>
              <h1>{produk.nama_produk}</h1>
              <div className="harga" style={{ fontSize: '1.5rem' }}>
                {formatRupiah(produk.harga)}
              </div>

              {produk.stok <= 0 ? (
                <p className="stok-habis">Stok saat ini habis</p>
              ) : (
                <p style={{ color: '#6b5b47' }}>Stok tersedia: {produk.stok} pcs</p>
              )}

              <h3 style={{ marginTop: 24 }}>Deskripsi</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{produk.deskripsi}</p>

              {stokUkuran ? (
                <PemilihUkuran produk={produk} stokUkuran={stokUkuran} hrefDasar={hrefDasar} />
              ) : (
                <TombolTambahKeranjangPolos produk={produk} hrefKontak={hrefDasar} />
              )}
            </div>
          </div>
        </div>
      </section>

      {produkTerkait.length > 0 && (
        <section className="bg-krem">
          <div className="container">
            <div className="section-judul">
              <h2>Produk Sejenis</h2>
            </div>
            <div className="grid-produk">
              {produkTerkait.map((p) => (
                <KartuProduk key={p.id} produk={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
