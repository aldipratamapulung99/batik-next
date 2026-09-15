'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useKeranjang } from '@/components/KonteksKeranjang';
import { formatRupiah } from '@/lib/helpers';
import { prosesCheckout } from './actions';

export default function CheckoutPage() {
  const { items, totalHarga, kosongkanKeranjang, sudahDimuat } = useKeranjang();
  const router = useRouter();
  const [sedangProses, setSedangProses] = useState(false);
  const [pesanError, setPesanError] = useState('');

  async function tanganiSubmit(e) {
    e.preventDefault();
    if (items.length === 0) return;

    setSedangProses(true);
    setPesanError('');

    const formData = new FormData(e.target);
    const hasil = await prosesCheckout({
      nama: formData.get('nama'),
      email: formData.get('email'),
      alamat: formData.get('alamat'),
      catatan: formData.get('catatan'),
      items,
    });

    setSedangProses(false);

    if (!hasil.sukses) {
      setPesanError(hasil.pesan);
      return;
    }

    kosongkanKeranjang();
    router.push(`/checkout/sukses?kode=${hasil.kodePesanan}`);
  }

  if (!sudahDimuat) return null;

  if (items.length === 0) {
    return (
      <section>
        <div className="container">
          <p>
            Keranjang Anda kosong, tidak ada yang bisa di-checkout. <Link href="/produk">Belanja dulu yuk</Link>.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="container">
        <div className="section-judul">
          <h2>Checkout</h2>
        </div>

        <div className="checkout-grid">
          <form className="form-standar" onSubmit={tanganiSubmit}>
            {pesanError && <div className="alert alert-error">{pesanError}</div>}

            <label htmlFor="nama">Nama Lengkap</label>
            <input type="text" id="nama" name="nama" required />

            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />

            <label htmlFor="alamat">Alamat Pengiriman</label>
            <textarea id="alamat" name="alamat" required />

            <label htmlFor="catatan">Catatan (opsional)</label>
            <textarea id="catatan" name="catatan" />

            <button type="submit" className="btn btn-emas" style={{ marginTop: 20 }} disabled={sedangProses}>
              {sedangProses ? 'Memproses...' : 'Buat Pesanan'}
            </button>
          </form>

          <div className="ringkasan-checkout">
            <h3>Ringkasan Pesanan</h3>
            <ul className="daftar-ringkasan">
              {items.map((it) => (
                <li key={`${it.produkId}-${it.ukuran || 'standar'}`}>
                  <span>
                    {it.namaProduk} {it.ukuran ? `(${it.ukuran})` : ''} &times; {it.jumlah}
                  </span>
                  <span>{formatRupiah(it.harga * it.jumlah)}</span>
                </li>
              ))}
            </ul>
            <div className="ringkasan-total">Total: {formatRupiah(totalHarga)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
