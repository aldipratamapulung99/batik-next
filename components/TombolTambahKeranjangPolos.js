'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useKeranjang } from './KonteksKeranjang';

export default function TombolTambahKeranjangPolos({ produk, hrefKontak }) {
  const { tambahItem } = useKeranjang();
  const [pesanStatus, setPesanStatus] = useState('');

  function tambahKeKeranjang() {
    tambahItem({
      produkId: produk.id,
      namaProduk: produk.nama_produk,
      harga: produk.harga,
      gambar: produk.gambar,
      ukuran: null,
      jumlah: 1,
    });
    setPesanStatus('Ditambahkan ke keranjang!');
    setTimeout(() => setPesanStatus(''), 2000);
  }

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 16 }}>
      <button type="button" className="btn btn-emas" onClick={tambahKeKeranjang} disabled={produk.stok <= 0}>
        Tambah ke Keranjang
      </button>
      <Link href={hrefKontak} className="btn btn-garis-soga">
        Pesan Langsung
      </Link>
      {pesanStatus && <span style={{ color: '#3E8E4F', fontWeight: 600 }}>{pesanStatus}</span>}
    </div>
  );
}
