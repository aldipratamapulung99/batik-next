import Link from 'next/link';
import KartuProduk from '@/components/KartuProduk';
import { ambilProduk } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function BerandaPage() {
  const produkUnggulan = await ambilProduk({ batas: 4 });

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <h1>Batik Asli, Ditulis dengan Tangan dan Cerita</h1>
            <p>
              Kami menghadirkan kain dan produk batik tulis serta batik cap langsung dari perajin di Jawa, dengan
              pewarna alami dan motif turun-temurun yang tetap relevan untuk gaya masa kini.
            </p>
            <p style={{ marginTop: 24 }}>
              <Link href="/produk" className="btn btn-emas">
                Lihat Semua Produk
              </Link>
              <Link href="/tentang" className="btn btn-outline" style={{ marginLeft: 10 }}>
                Kisah Kami
              </Link>
            </p>
          </div>
          <div className="hero-visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/placeholder-batik.svg" alt="Motif batik" />
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-judul">
            <h2>Produk Unggulan</h2>
            <p>Beberapa karya pilihan yang paling diminati pelanggan kami bulan ini.</p>
          </div>
          <div className="grid-produk">
            {produkUnggulan.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-krem">
        <div className="container">
          <div className="section-judul">
            <h2>Mengapa Memilih Kami</h2>
          </div>
          <div className="grid-produk" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            <div className="kartu-produk" style={{ border: 'none', textAlign: 'center', padding: 24 }}>
              <h3>Perajin Asli</h3>
              <p>Setiap kain dikerjakan langsung oleh perajin batik dari Yogyakarta, Solo, dan Cirebon.</p>
            </div>
            <div className="kartu-produk" style={{ border: 'none', textAlign: 'center', padding: 24 }}>
              <h3>Pewarna Alami</h3>
              <p>Sebagian besar produk menggunakan pewarna alami dari tumbuhan seperti indigo dan soga.</p>
            </div>
            <div className="kartu-produk" style={{ border: 'none', textAlign: 'center', padding: 24 }}>
              <h3>Pengiriman Aman</h3>
              <p>Kain dikemas rapi dengan kertas anti lembap sebelum dikirim ke seluruh Indonesia.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}