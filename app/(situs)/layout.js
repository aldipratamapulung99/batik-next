import '../globals.css';
import Link from 'next/link';
import NavToggle from '@/components/NavToggle';
import IkonKeranjang from '@/components/IkonKeranjang';
import { PenyediaKeranjang } from '@/components/KonteksKeranjang';

export const metadata = {
  title: 'Batik Nusantara',
  description: 'Batik tulis dan batik cap asli perajin lokal Indonesia.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <PenyediaKeranjang>
          <header className="site-header">
            <nav className="navbar">
              <Link href="/" className="brand">
                Batik<span>Nusantara</span>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ul className="nav-links">
                  <li>
                    <Link href="/">Beranda</Link>
                  </li>
                  <li>
                    <Link href="/produk">Produk</Link>
                  </li>
                  <li>
                    <Link href="/tentang">Tentang Kami</Link>
                  </li>
                  <li>
                    <Link href="/kontak">Kontak</Link>
                  </li>
                </ul>
                <IkonKeranjang />
                <NavToggle />
              </div>
            </nav>
          </header>

          {children}

          <footer className="site-footer">
            <div className="footer-inner">
              <div>
                <h4 style={{ color: '#F0E6D2', marginBottom: 8 }}>Batik Nusantara</h4>
                <p style={{ maxWidth: '32ch', color: '#a9b6bc' }}>
                  Melestarikan warisan batik Indonesia lewat karya tulis dan cap tangan asli perajin lokal.
                </p>
              </div>
              <div>
                <h4 style={{ color: '#F0E6D2', marginBottom: 8 }}>Tautan</h4>
                <p>
                  <Link href="/produk">Semua Produk</Link>
                </p>
                <p>
                  <Link href="/keranjang">Keranjang Belanja</Link>
                </p>
                <p>
                  <Link href="/kontak">Hubungi Kami</Link>
                </p>
                <p>
                  <Link href="/admin/login">Login Admin</Link>
                </p>
                <p>
                  <Link href="http://profile-website-sand-three.vercel.app">Portofolio Saya</Link>
                </p>
              </div>
            </div>
            <div className="footer-bawah">&copy; {new Date().getFullYear()} Batik Nusantara.</div>
          </footer>
        </PenyediaKeranjang>
      </body>
    </html>
  );
}
