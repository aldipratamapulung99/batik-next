'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useKeranjang } from './KonteksKeranjang';

export default function PemilihUkuran({ produk, stokUkuran, hrefDasar }) {
  const { tambahItem } = useKeranjang();
  const [ukuranDipilih, setUkuranDipilih] = useState(null);
  const [pesanStatus, setPesanStatus] = useState('');

  const stokTerpilih = ukuranDipilih ? stokUkuran[ukuranDipilih] : null;
  const href = ukuranDipilih ? `${hrefDasar}&ukuran=${encodeURIComponent(ukuranDipilih)}` : hrefDasar;

  function tambahKeKeranjang() {
    if (!ukuranDipilih) return;
    tambahItem({
      produkId: produk.id,
      namaProduk: produk.nama_produk,
      harga: produk.harga,
      gambar: produk.gambar,
      ukuran: ukuranDipilih,
      jumlah: 1,
    });
    setPesanStatus('Ditambahkan ke keranjang!');
    setTimeout(() => setPesanStatus(''), 2000);
  }

  return (
    <>
      <p style={{ color: '#6b5b47', marginTop: 20, marginBottom: 6 }}>
        Pilih ukuran:{' '}
        <span style={{ fontWeight: 600, color: 'var(--indigo-dark)' }}>
          {ukuranDipilih ? `(Stok ${ukuranDipilih}: ${stokTerpilih} pcs)` : ''}
        </span>
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.entries(stokUkuran).map(([ukuran, stok]) =>
          stok > 0 ? (
            <button
              key={ukuran}
              type="button"
              className={`btn-ukuran${ukuranDipilih === ukuran ? ' dipilih' : ''}`}
              onClick={() => setUkuranDipilih(ukuran)}
            >
              {ukuran}
            </button>
          ) : (
            <span key={ukuran} className="btn-ukuran btn-ukuran-habis" title="Stok habis">
              {ukuran}
            </span>
          )
        )}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 16 }}>
        <button
          type="button"
          className={`btn btn-emas${ukuranDipilih ? '' : ' btn-nonaktif'}`}
          onClick={tambahKeKeranjang}
        >
          Tambah ke Keranjang
        </button>
        <Link href={href} className={`btn btn-garis-soga${ukuranDipilih ? '' : ' btn-nonaktif'}`}>
          Pesan Langsung
        </Link>
        {pesanStatus && <span style={{ color: '#3E8E4F', fontWeight: 600 }}>{pesanStatus}</span>}
      </div>
    </>
  );
}
