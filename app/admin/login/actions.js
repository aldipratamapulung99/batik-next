'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ambilAdminByUsername } from '@/lib/data';
import { verifikasiPassword } from '@/lib/password';
import { ADMIN_COOKIE_NAME, buatTokenSesi, buatPayloadSesi, opsiCookieSesi } from '@/lib/session';

export async function loginAdmin(formData) {
  const username = (formData.get('username') || '').toString().trim();
  const password = (formData.get('password') || '').toString();

  const admin = await ambilAdminByUsername(username);
  const cocok = admin ? await verifikasiPassword(password, admin.password) : false;

  if (!admin || !cocok) {
    redirect('/admin/login?error=1');
  }

  const token = await buatTokenSesi(buatPayloadSesi(admin));
  cookies().set(ADMIN_COOKIE_NAME, token, opsiCookieSesi());

  redirect('/admin/dashboard');
}
