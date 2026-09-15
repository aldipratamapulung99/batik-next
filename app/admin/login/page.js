import Link from 'next/link';
import { loginAdmin } from './actions';

export const metadata = { title: 'Login Admin — Batik Nusantara' };

export default function LoginAdminPage({ searchParams }) {
  const adaError = searchParams?.error === '1';

  return (
    <div style={{ background: 'var(--indigo-dark)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 380, margin: '0 auto', position: 'relative', top: 80, background: 'var(--putih)', padding: 32, borderRadius: 6 }}>
        <h2 style={{ textAlign: 'center' }}>Login Admin</h2>

        {adaError && <div className="alert alert-error">Username atau password salah.</div>}

        <form className="form-standar" action={loginAdmin}>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" required />

          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />

          <button type="submit" className="btn btn-emas" style={{ width: '100%', marginTop: 20 }}>
            Masuk
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="/">&larr; Kembali ke website</Link>
        </p>
      </div>
    </div>
  );
}
