import Link from 'next/link';
import KartuProduk from '@/components/KartuProduk';
import { ambilProduk, ambilSemuaKategori } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function ProdukPage({ searchParams }) {
  const kategoriId = searchParams?.kategori ? Number(searchParams.kategori) : null;
  const kataKunci = searchParams?.cari || null;

  const [daftarKategori, daftarProduk] = await Promise.all([
    ambilSemuaKategori(),
    ambilProduk({ kategoriId, kataKunci }),
  ]);

  return (
    <section>
      <div className="container">
        <div className="section-judul">
          <h2>Semua Produk</h2>
          <p>Jelajahi koleksi batik tulis, batik cap, kain, dan aksesoris dari perajin lokal.</p>
        </div>

        <form className="form-cari" method="get">
          {kategoriId ? <input type="hidden" name="kategori" value={kategoriId} /> : null}
          <input type="text" name="cari" placeholder="Cari nama produk..." defaultValue={kataKunci || ''} />
          <button type="submit" className="btn btn-emas">
            Cari
          </button>
        </form>

        <div className="filter-bar">
          <Link href="/produk" className={!kategoriId ? 'aktif' : ''}>
            Semua
          </Link>
          {daftarKategori.map((kat) => (
            <Link key={kat.id} href={`/produk?kategori=${kat.id}`} className={kategoriId === kat.id ? 'aktif' : ''}>
              {kat.nama_kategori}
            </Link>
          ))}
        </div>

        {daftarProduk.length === 0 ? (
          <p>Tidak ada produk yang cocok dengan pencarian Anda.</p>
        ) : (
          <div className="grid-produk">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} tampilkanStok />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
