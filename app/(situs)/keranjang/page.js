'use client';

import Link from 'next/link';
import { useKeranjang } from '@/components/KonteksKeranjang';
import { formatRupiah, urlGambar } from '@/lib/helpers';

export default function KeranjangPage() {
  const { items, ubahJumlah, hapusItem, totalHarga, sudahDimuat } = useKeranjang();

  if (!sudahDimuat) return null;

  return (
    <section>
      <div className="container">
        <div className="section-judul">
          <h2>Keranjang Belanja</h2>
        </div>

        {items.length === 0 ? (
          <p>
            Keranjang Anda masih kosong. <Link href="/produk">Lihat produk</Link>.
          </p>
        ) : (
          <>
            <table className="tabel-admin">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Ukuran</th>
                  <th>Harga</th>
                  <th>Jumlah</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={`${it.produkId}-${it.ukuran || 'standar'}`}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={urlGambar(it.gambar)}
                        alt={it.namaProduk}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                      />
                      {it.namaProduk}
                    </td>
                    <td>{it.ukuran || '-'}</td>
                    <td>{formatRupiah(it.harga)}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={it.jumlah}
                        onChange={(e) => ubahJumlah(it.produkId, it.ukuran, Number(e.target.value) || 1)}
                        style={{ width: 64, padding: 6 }}
                      />
                    </td>
                    <td>{formatRupiah(it.harga * it.jumlah)}</td>
                    <td>
                      <button
                        type="button"
                        className="aksi-link hapus-link"
                        style={{ background: 'none', border: 'none', color: '#a33', cursor: 'pointer' }}
                        onClick={() => hapusItem(it.produkId, it.ukuran)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="ringkasan-keranjang">
              <div className="ringkasan-total">Total: {formatRupiah(totalHarga)}</div>
              <Link href="/checkout" className="btn btn-emas">
                Lanjut ke Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
