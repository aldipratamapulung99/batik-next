import { ambilProdukById, ambilStokUkuran } from '@/lib/data';
import { formatRupiah, kategoriTanpaUkuran } from '@/lib/helpers';
import { kirimPesan } from './actions';

export const metadata = { title: 'Kontak — Batik Nusantara' };
export const dynamic = 'force-dynamic';

export default async function KontakPage({ searchParams }) {
  const status = searchParams?.status || '';
  const pesanStatus = searchParams?.pesan || '';
  const ukuranTampil = searchParams?.ukuran || '';
  const produkIdTampil = searchParams?.produk_id ? Number(searchParams.produk_id) : 0;

  const produkDipesan = produkIdTampil > 0 ? await ambilProdukById(produkIdTampil) : null;

  let stokMaks = 0;
  if (produkDipesan) {
    if (produkDipesan.pakai_ukuran) {
      const dataStokUkuran = await ambilStokUkuran(produkDipesan.id);
      stokMaks = dataStokUkuran[ukuranTampil] || 0;
    } else {
      stokMaks = produkDipesan.stok;
    }
  }

  const tampilkanUkuran = !(produkDipesan && kategoriTanpaUkuran().includes(produkDipesan.nama_kategori));

  return (
    <section>
      <div className="container">
        <div className="section-judul" style={{ textAlign: 'left', maxWidth: 560, marginLeft: 0 }}>
          <h1>Hubungi Kami</h1>
          <p>Ada pertanyaan tentang motif, ukuran, atau ingin memesan khusus? Kirimkan pesan Anda di bawah ini.</p>
        </div>

        {status && (
          <div className={`alert ${status === 'sukses' ? 'alert-sukses' : 'alert-error'}`} style={{ maxWidth: 560 }}>
            {pesanStatus}
          </div>
        )}

        <form className="form-standar" action={kirimPesan} id="form-kontak">
          {produkDipesan && (
            <>
              <input type="hidden" name="produk_id" value={produkDipesan.id} />
              <div className="alert" style={{ maxWidth: 560, background: '#f0ead9' }}>
                Memesan: <strong>{produkDipesan.nama_produk}</strong>
                {ukuranTampil ? ` (ukuran ${ukuranTampil})` : ''} ({formatRupiah(produkDipesan.harga)}) — stok
                tersedia {stokMaks} pcs
              </div>

              <label htmlFor="jumlah">Jumlah</label>
              <input type="number" id="jumlah" name="jumlah" min={1} max={stokMaks} defaultValue={1} />
            </>
          )}

          <label htmlFor="nama">Nama Lengkap</label>
          <input type="text" id="nama" name="nama" required />

          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />

          <label htmlFor="alamat">Alamat Pengiriman{produkDipesan ? ' (wajib diisi)' : ' (opsional)'}</label>
          <textarea id="alamat" name="alamat" required={!!produkDipesan}></textarea>

          <label htmlFor="subjek">Subjek</label>
          {produkDipesan ? (
            <>
              <input type="text" value={produkDipesan.nama_produk} disabled readOnly />
              <input type="hidden" name="subjek" value={produkDipesan.nama_produk} />
            </>
          ) : (
            <input type="text" id="subjek" name="subjek" />
          )}

          {tampilkanUkuran &&
            (produkDipesan && produkDipesan.pakai_ukuran ? (
              <>
                <label>Ukuran</label>
                <input type="text" value={ukuranTampil} disabled readOnly />
                <input type="hidden" name="ukuran" value={ukuranTampil} />
              </>
            ) : (
              <>
                <label htmlFor="ukuran">Ukuran</label>
                <select id="ukuran" name="ukuran" defaultValue="">
                  <option value="">-- Pilih ukuran (opsional) --</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="Custom / Sebutkan di pesan">Custom / Sebutkan di pesan</option>
                </select>
              </>
            ))}

          <label htmlFor="isi_pesan">Pesan</label>
          <textarea id="isi_pesan" name="isi_pesan" required minLength={10}></textarea>

          <button type="submit" className="btn btn-emas" style={{ marginTop: 20 }}>
            Kirim Pesan
          </button>
        </form>
      </div>
    </section>
  );
}