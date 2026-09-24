import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase khusus server (Server Components, Server Actions, Route Handlers).
 * Memakai SERVICE ROLE KEY supaya bisa baca/tulis penuh tanpa bergantung pada RLS,
 * meniru perilaku koneksi mysqli 'root' di config.php lama.
 *
 * JANGAN import file ini dari komponen client ('use client').
 */
export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Konfigurasi Supabase belum lengkap. Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah diisi di .env.local'
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
    global: {
      // Next 14 meng-cache fetch secara bawaan; matikan supaya data selalu diambil langsung dari database
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}