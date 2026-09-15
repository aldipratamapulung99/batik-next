'use client';

import Link from 'next/link';
import { useKeranjang } from './KonteksKeranjang';

export default function IkonKeranjang() {
  const { totalItem } = useKeranjang();

  return (
    <Link href="/keranjang" className="ikon-keranjang" aria-label="Lihat keranjang belanja">
      &#128722;
      {totalItem > 0 && <span className="badge-keranjang">{totalItem}</span>}
    </Link>
  );
}
