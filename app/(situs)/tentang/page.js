import Link from 'next/link';

export const metadata = { title: 'Tentang Kami — Batik Nusantara' };

export default function TentangPage() {
  return (
    <section>
      <div className="container" style={{ maxWidth: 780 }}>
        <h1>Tentang Batik Nusantara</h1>
        <p>
          Batik Nusantara berawal dari sebuah rumah produksi kecil di pinggiran Yogyakarta, tempat sekelompok
          perajin menuliskan malam panas ke atas kain dengan canting, satu goresan demi satu goresan. Sejak awal
          kami percaya bahwa batik bukan sekadar kain bermotif, melainkan catatan sejarah dan filosofi yang
          diwariskan turun-temurun.
        </p>

        <p>
          Hari ini, kami bekerja sama dengan lebih dari 20 perajin dari Yogyakarta, Solo, dan Cirebon untuk
          menghadirkan batik tulis dan batik cap berkualitas tinggi, langsung ke tangan Anda tanpa melalui terlalu
          banyak perantara — supaya perajin mendapatkan penghasilan yang adil dan pembeli mendapatkan harga yang
          wajar.
        </p>

        <h2 style={{ marginTop: 40 }}>Nilai yang Kami Pegang</h2>
        <ul>
          <li>
            <strong>Keaslian.</strong> Setiap produk dibuat dengan teknik batik tradisional, bukan cetak tekstil
            biasa.
          </li>
          <li>
            <strong>Keberlanjutan.</strong> Kami mengutamakan pewarna alami dan kain berkualitas yang tahan lama.
          </li>
          <li>
            <strong>Keadilan bagi perajin.</strong> Harga produk mencerminkan waktu dan keahlian perajin yang
            mengerjakannya.
          </li>
        </ul>

        <h2 style={{ marginTop: 40 }}>Hubungi Kami</h2>
        <p>
          Punya pertanyaan tentang motif tertentu atau ingin memesan dalam jumlah besar? Kunjungi halaman{' '}
          <Link href="/kontak">Kontak</Link> dan kirimkan pesan Anda — tim kami akan membalas secepatnya.
        </p>
      </div>
    </section>
  );
}
