import bcrypt from 'bcryptjs';

/**
 * Password admin lama dibuat dengan PHP password_hash() yang memakai prefix
 * "$2y$". bcryptjs (library JS) memakai prefix "$2a$"/"$2b$" -- secara
 * algoritma sama persis, jadi cukup ganti prefiksnya sebelum verifikasi.
 */
export async function verifikasiPassword(passwordInput, hashDariDb) {
  if (!hashDariDb) return false;
  const hashKompatibel = hashDariDb.replace(/^\$2y\$/, '$2b$');
  return bcrypt.compare(passwordInput, hashKompatibel);
}

export async function buatHashPassword(passwordPolos) {
  return bcrypt.hash(passwordPolos, 10);
}
