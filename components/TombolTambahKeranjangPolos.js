'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useKeranjang } from './KonteksKeranjang';
import { PemilihJumlah } from './PemilihUkuran';

export default function TombolTambahKeranjangPolos({ produk, hrefKontak }) {
  const { tambahItem } = useKeranjang();
  const [jumlah, setJumlah] = useState(1);
  const [pesanStatus, setPesanStatus] = useState('');

  const habis = produk.stok <= 0;
  const jumlahAman = Math.min(jumlah, Math.max(produk.stok, 1));

  function tambahKeKeranjang() {
    tambahItem({
      produkId: produk.id,
      namaProduk: produk.nama_produk,
      harga: produk.harga,
      gambar: produk.gambar,
      ukuran: null,
      jumlah: jumlahAman,
    });
    setPesanStatus(`${jumlahAman} pcs ditambahkan ke keranjang!`);
    setTimeout(() => setPesanStatus(''), 2000);
  }

  return (
    <>
      <div className="baris-jumlah">
        <span className="label-jumlah">Jumlah</span>
        <PemilihJumlah nilai={jumlahAman} maks={produk.stok} onUbah={setJumlah} nonaktif={habis} />
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 16 }}>
        <button type="button" className="btn btn-emas" onClick={tambahKeKeranjang} disabled={habis}>
          Tambah ke Keranjang
        </button>
        <Link href={`${hrefKontak}&jumlah=${jumlahAman}`} className={`btn btn-garis-soga${habis ? ' btn-nonaktif' : ''}`}>
          Pesan Langsung
        </Link>
        {pesanStatus && <span style={{ color: '#3E8E4F', fontWeight: 600 }}>{pesanStatus}</span>}
      </div>
    </>
  );
}