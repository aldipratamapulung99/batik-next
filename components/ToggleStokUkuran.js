'use client';

import { useState } from 'react';
import { daftarUkuranBaku } from '@/lib/helpers';

export default function ToggleStokUkuran({ pakaiUkuranAwal = false, stokAwal = 0, stokUkuranAwal = {} }) {
  const [pakaiUkuran, setPakaiUkuran] = useState(pakaiUkuranAwal);

  return (
    <>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <input
          type="checkbox"
          name="pakai_ukuran"
          style={{ width: 'auto' }}
          checked={pakaiUkuran}
          onChange={(e) => setPakaiUkuran(e.target.checked)}
        />
        Produk ini punya ukuran (S/M/L/XL/XXL)
      </label>

      <div style={{ display: pakaiUkuran ? 'none' : 'block' }}>
        <label htmlFor="stok">Stok</label>
        <input type="number" id="stok" name="stok" min={0} defaultValue={stokAwal} />
      </div>

      <div style={{ display: pakaiUkuran ? 'block' : 'none' }}>
        <label>Stok per Ukuran</label>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {daftarUkuranBaku().map((ukuran) => (
            <div key={ukuran}>
              <label htmlFor={`ukuran_${ukuran}`} style={{ fontWeight: 600 }}>
                {ukuran}
              </label>
              <input
                type="number"
                id={`ukuran_${ukuran}`}
                name={`stok_ukuran_${ukuran}`}
                min={0}
                defaultValue={stokUkuranAwal[ukuran] || 0}
                style={{ width: 80 }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
