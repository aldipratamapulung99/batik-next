'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useKeranjang } from './KonteksKeranjang';
import { formatRupiah } from '@/lib/helpers';

/** Pemilih jumlah ala marketplace: [-] [angka] [+], dibatasi stok maksimal */
export function PemilihJumlah({ nilai, maks, onUbah, nonaktif = false }) {
  const [draft, setDraft] = useState(null);
  const batasAtas = Math.max(maks, 1);

  function ubah(n) {
    onUbah(Math.min(Math.max(n, 1), batasAtas));
  }

  function tanganiKetik(e) {
    const teks = e.target.value.replace(/\D/g, '');
    setDraft(teks);
    const n = parseInt(teks, 10);
    if (!isNaN(n)) ubah(n);
  }

  return (
    <div className="pemilih-jumlah">
      <button type="button" onClick={() => ubah(nilai - 1)} disabled={nonaktif || nilai <= 1} aria-label="Kurangi jumlah">
        &minus;
      </button>
      <input
        type="text"
        inputMode="numeric"
        className="input-jumlah"
        value={draft ?? nilai}
        onChange={tanganiKetik}
        onBlur={() => setDraft(null)}
        disabled={nonaktif}
        aria-label="Jumlah"
      />
      <button type="button" onClick={() => ubah(nilai + 1)} disabled={nonaktif || nilai >= batasAtas} aria-label="Tambah jumlah">
        +
      </button>
    </div>
  );
}

/** Ringkasan pesanan di halaman kontak (Pesan Langsung): jumlah bisa diubah, total ikut berubah */
export function RingkasanPesananLangsung({ namaProduk, ukuran, harga, stokMaks, jumlahAwal }) {
  const [jumlah, setJumlah] = useState(jumlahAwal);

  return (
    <div className="ringkasan-checkout ringkasan-pesan-langsung">
      <h3>Ringkasan Pesanan</h3>
      <ul className="daftar-ringkasan">
        <li>
          <span>
            {namaProduk} {ukuran ? `(${ukuran})` : ''} &times; {jumlah}
          </span>
          <span>{formatRupiah(harga * jumlah)}</span>
        </li>
      </ul>
      <div className="baris-jumlah">
        <span className="label-jumlah">Jumlah</span>
        <PemilihJumlah nilai={jumlah} maks={stokMaks} onUbah={setJumlah} />
        <span className="info-stok">Stok tersedia: {stokMaks} pcs</span>
      </div>
      <input type="hidden" name="jumlah" value={jumlah} />
      <div className="ringkasan-total">Total: {formatRupiah(harga * jumlah)}</div>
    </div>
  );
}

export default function PemilihUkuran({ produk, stokUkuran, hrefDasar }) {
  const { tambahItem } = useKeranjang();
  const [ukuranDipilih, setUkuranDipilih] = useState(null);
  const [jumlah, setJumlah] = useState(1);
  const [pesanStatus, setPesanStatus] = useState('');

  const stokTerpilih = ukuranDipilih ? stokUkuran[ukuranDipilih] : 0;
  // Jumlah selalu dijaga tidak melebihi stok ukuran yang sedang dipilih
  const jumlahAman = Math.min(jumlah, Math.max(stokTerpilih, 1));
  const href = ukuranDipilih
    ? `${hrefDasar}&ukuran=${encodeURIComponent(ukuranDipilih)}&jumlah=${jumlahAman}`
    : hrefDasar;

  function tambahKeKeranjang() {
    if (!ukuranDipilih) return;
    tambahItem({
      produkId: produk.id,
      namaProduk: produk.nama_produk,
      harga: produk.harga,
      gambar: produk.gambar,
      ukuran: ukuranDipilih,
      jumlah: jumlahAman,
    });
    setPesanStatus(`${jumlahAman} pcs ditambahkan ke keranjang!`);
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

      <div className="baris-jumlah">
        <span className="label-jumlah">Jumlah</span>
        <PemilihJumlah nilai={jumlahAman} maks={stokTerpilih} onUbah={setJumlah} nonaktif={!ukuranDipilih} />
        {!ukuranDipilih && <span className="info-stok">Pilih ukuran dulu</span>}
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