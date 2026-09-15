'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const KUNCI_PENYIMPANAN = 'keranjang_batik_nusantara';

const KonteksKeranjang = createContext(null);

function buatKunciItem(produkId, ukuran) {
  return `${produkId}-${ukuran || 'standar'}`;
}

export function PenyediaKeranjang({ children }) {
  const [items, setItems] = useState([]);
  const [sudahDimuat, setSudahDimuat] = useState(false);

  // Muat keranjang dari localStorage sekali saat halaman pertama dibuka
  useEffect(() => {
    try {
      const tersimpan = window.localStorage.getItem(KUNCI_PENYIMPANAN);
      if (tersimpan) setItems(JSON.parse(tersimpan));
    } catch (e) {
      // localStorage tidak tersedia/rusak -- keranjang mulai kosong saja
    }
    setSudahDimuat(true);
  }, []);

  // Simpan ulang ke localStorage setiap kali isi keranjang berubah
  useEffect(() => {
    if (!sudahDimuat) return;
    window.localStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(items));
  }, [items, sudahDimuat]);

  function tambahItem(itemBaru) {
    setItems((sebelumnya) => {
      const kunci = buatKunciItem(itemBaru.produkId, itemBaru.ukuran);
      const sudahAda = sebelumnya.find((it) => buatKunciItem(it.produkId, it.ukuran) === kunci);

      if (sudahAda) {
        return sebelumnya.map((it) =>
          buatKunciItem(it.produkId, it.ukuran) === kunci ? { ...it, jumlah: it.jumlah + itemBaru.jumlah } : it
        );
      }
      return [...sebelumnya, itemBaru];
    });
  }

  function ubahJumlah(produkId, ukuran, jumlahBaru) {
    setItems((sebelumnya) =>
      sebelumnya
        .map((it) =>
          buatKunciItem(it.produkId, it.ukuran) === buatKunciItem(produkId, ukuran) ? { ...it, jumlah: jumlahBaru } : it
        )
        .filter((it) => it.jumlah > 0)
    );
  }

  function hapusItem(produkId, ukuran) {
    setItems((sebelumnya) =>
      sebelumnya.filter((it) => buatKunciItem(it.produkId, it.ukuran) !== buatKunciItem(produkId, ukuran))
    );
  }

  function kosongkanKeranjang() {
    setItems([]);
  }

  const totalItem = items.reduce((total, it) => total + it.jumlah, 0);
  const totalHarga = items.reduce((total, it) => total + it.jumlah * it.harga, 0);

  return (
    <KonteksKeranjang.Provider
      value={{ items, tambahItem, ubahJumlah, hapusItem, kosongkanKeranjang, totalItem, totalHarga, sudahDimuat }}
    >
      {children}
    </KonteksKeranjang.Provider>
  );
}

export function useKeranjang() {
  const ctx = useContext(KonteksKeranjang);
  if (!ctx) throw new Error('useKeranjang harus dipakai di dalam PenyediaKeranjang');
  return ctx;
}
