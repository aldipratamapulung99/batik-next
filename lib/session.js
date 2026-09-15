// Pengganti session PHP ($_SESSION['admin_id']) untuk lingkungan serverless Vercel.
// Data admin yang login disimpan di cookie httpOnly, ditandatangani dengan HMAC-SHA256
// supaya tidak bisa dipalsukan dari sisi client. Pakai Web Crypto API (bukan modul
// Node 'crypto') supaya sama-sama jalan di middleware (Edge runtime) maupun server action.

export const ADMIN_COOKIE_NAME = 'admin_session';
const UMUR_COOKIE_DETIK = 60 * 60 * 24 * 7; // 7 hari, sama seperti sesi PHP default browser

function ambilSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET belum diisi di environment variables.');
  }
  return secret;
}

function keBase64Url(bytes) {
  let biner = '';
  bytes.forEach((b) => (biner += String.fromCharCode(b)));
  return btoa(biner).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function dariBase64Url(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + ((4 - (str.length % 4)) % 4), '=');
  const biner = atob(padded);
  const bytes = new Uint8Array(biner.length);
  for (let i = 0; i < biner.length; i++) bytes[i] = biner.charCodeAt(i);
  return bytes;
}

async function importKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/** Membuat token sesi bertanda tangan dari data admin yang login */
export async function buatTokenSesi(data) {
  const secret = ambilSecret();
  const key = await importKey(secret);
  const payload = keBase64Url(new TextEncoder().encode(JSON.stringify(data)));
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const signature = keBase64Url(new Uint8Array(signatureBuffer));
  return `${payload}.${signature}`;
}

/** Memverifikasi token sesi, mengembalikan data admin jika valid, atau null */
export async function verifikasiTokenSesi(token) {
  if (!token || !token.includes('.')) return null;

  try {
    const secret = ambilSecret();
    const [payload, signature] = token.split('.');
    const key = await importKey(secret);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      dariBase64Url(signature),
      new TextEncoder().encode(payload)
    );
    if (!valid) return null;

    const data = JSON.parse(new TextDecoder().decode(dariBase64Url(payload)));
    if (data.exp && Date.now() > data.exp) return null;

    return data;
  } catch {
    return null;
  }
}

export function opsiCookieSesi() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: UMUR_COOKIE_DETIK,
  };
}

export function buatPayloadSesi(admin) {
  return {
    id: admin.id,
    username: admin.username,
    exp: Date.now() + UMUR_COOKIE_DETIK * 1000,
  };
}
