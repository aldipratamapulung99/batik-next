import Link from 'next/link';
import { formatRupiah, urlGambar } from '@/lib/helpers';

export default function KartuProduk({ produk, tampilkanStok = false }) {
  return (
    <div className="kartu-produk">
      <Link href={`/produk/${produk.id}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={urlGambar(produk.gambar)} alt={produk.nama_produk} />
      </Link>
      <div className="kartu-produk-isi">
        <span className="kategori-label">{produk.nama_kategori}</span>
        <h3>
          <Link href={`/produk/${produk.id}`} style={{ color: 'inherit' }}>
            {produk.nama_produk}
          </Link>
        </h3>
        <div className="harga">{formatRupiah(produk.harga)}</div>
        {tampilkanStok &&
          (produk.stok <= 0 ? (
            <p className="stok-habis">Stok habis</p>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#6b5b47' }}>Stok: {produk.stok}</p>
          ))}
        <Link href={`/produk/${produk.id}`} className="btn btn-emas" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}
