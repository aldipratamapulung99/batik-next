import Link from 'next/link';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, verifikasiTokenSesi } from '@/lib/session';

export default async function AdminProtectedLayout({ children }) {
  // Middleware sudah memblokir akses tanpa sesi valid; ini lapisan kedua
  // supaya nama admin bisa ditampilkan di sidebar (mirip $_SESSION['admin_username']).
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  const sesi = await verifikasiTokenSesi(token);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <h3 style={{ color: 'var(--emas)' }}>Batik Nusantara</h3>
        <p style={{ fontSize: '0.85rem', color: '#c7d0d4' }}>Halo, {sesi?.username || 'Admin'}</p>
        <nav style={{ marginTop: 24 }}>
          <Link href="/admin/dashboard">Dashboard</Link>
          <Link href="/admin/tambah">Tambah Produk</Link>
          <Link href="/admin/kategori">Kategori</Link>
          <Link href="/admin/pesan">Pesan Masuk</Link>
          <Link href="/admin/laporan">Laporan Penjualan</Link>
          <Link href="/">Lihat Website</Link>
          <Link href="/admin/logout">Keluar</Link>
        </nav>
      </aside>
      <main className="admin-konten">{children}</main>
    </div>
  );
}
