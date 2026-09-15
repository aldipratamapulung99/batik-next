import '../globals.css';

export const metadata = { title: 'Admin — Batik Nusantara' };

export default function AdminRootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
