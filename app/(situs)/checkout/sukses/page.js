import Link from 'next/link';

export default function CheckoutSuksesPage({ searchParams }) {
  const kode = searchParams?.kode || '';

  return (
    <section>
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2>Pesanan Berhasil Dibuat!</h2>
        <p>Terima kasih, pesanan Anda sudah kami terima dan sedang menunggu diproses.</p>
        {kode && (
          <p>
            Kode pesanan Anda: <strong>{kode}</strong>
          </p>
        )}
        <p>Kami akan menghubungi Anda melalui email untuk konfirmasi selanjutnya.</p>
        <Link href="/produk" className="btn btn-emas" style={{ marginTop: 16, display: 'inline-block' }}>
          Kembali Belanja
        </Link>
      </div>
    </section>
  );
}
