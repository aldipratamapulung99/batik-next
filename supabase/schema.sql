-- =====================================================================
-- Batik Nusantara — Skema Supabase (PostgreSQL)
-- Konversi dari database.sql (MySQL) versi PHP lama.
--
-- CARA PAKAI:
-- 1. Buka project Supabase kamu -> SQL Editor -> New query
-- 2. Paste seluruh isi file ini -> Run
-- 3. Cek Table Editor, pastikan 5 tabel (admin, kategori, produk,
--    produk_ukuran, pesan) sudah muncul beserta data awalnya.
-- =====================================================================

-- ---------------------------------------------------------------------
-- TABEL
-- ---------------------------------------------------------------------

create table if not exists admin (
  id serial primary key,
  username varchar(50) not null unique,
  password varchar(255) not null
);

create table if not exists kategori (
  id serial primary key,
  nama_kategori varchar(50) not null
);

create table if not exists produk (
  id serial primary key,
  kategori_id integer not null references kategori(id),
  nama_produk varchar(100) not null,
  deskripsi text,
  harga numeric(12,2) not null,
  stok integer not null default 0,
  pakai_ukuran boolean not null default false,
  gambar varchar(255) default 'placeholder-batik.svg',
  dibuat_pada timestamptz not null default now()
);

create table if not exists produk_ukuran (
  id serial primary key,
  produk_id integer not null references produk(id) on delete cascade,
  ukuran varchar(5) not null,
  stok integer not null default 0,
  unique (produk_id, ukuran)
);

create table if not exists pesan (
  id serial primary key,
  nama varchar(100) not null,
  email varchar(100) not null,
  alamat text default '',
  produk_id integer references produk(id),
  jumlah integer not null default 1,
  subjek varchar(150) default '',
  ukuran varchar(50) default '',
  isi_pesan text not null,
  status varchar(20) not null default 'Baru',
  dibuat_pada timestamptz not null default now()
);

create index if not exists idx_produk_kategori on produk(kategori_id);
create index if not exists idx_pesan_produk on pesan(produk_id);

-- ---------------------------------------------------------------------
-- DATA AWAL (dipindah dari database.sql)
-- Password admin default masih sama: admin / admin123
-- (hash bcrypt lama tetap kompatibel lewat lib/password.js)
-- ---------------------------------------------------------------------

insert into admin (id, username, password) values
  (1, 'admin', '$2y$10$a9ZR0ORUYxJY/YuBDdKTeOtbv6JtNo6OJErRVg/bq7ncSVfmVmMlC')
on conflict (id) do nothing;

insert into kategori (id, nama_kategori) values
  (1, 'Batik Tulis'),
  (2, 'Batik Cap'),
  (3, 'Kain Batik'),
  (4, 'Aksesoris Batik')
on conflict (id) do nothing;

insert into produk (id, kategori_id, nama_produk, deskripsi, harga, stok, pakai_ukuran, gambar, dibuat_pada) values
  (2, 1, 'Batik Tulis Motif Kawung', 'Motif kawung melambangkan kesucian dan keadilan, dibuat dengan pewarna alami dari tumbuhan indigo.', 950000.00, 4, true, 'produk_1788315833_595.jpg', '2026-09-02 01:21:38'),
  (3, 2, 'Batik Cap Motif Mega Mendung', 'Batik cap khas Cirebon dengan motif awan mega mendung, warna cerah dan tahan lama.', 350000.00, 16, true, 'produk_1788316405_263.jpg', '2026-09-02 01:21:38'),
  (4, 2, 'Batik Cap Motif Sekar Jagad', 'Motif sekar jagad melambangkan keberagaman, cocok untuk kemeja formal maupun santai.', 375000.00, 16, true, 'produk_1788318188_200.jpg', '2026-09-02 01:21:38'),
  (5, 3, 'Kain Batik Sogan 2 Meter', 'Kain batik warna sogan (coklat khas Solo), bahan katun primisima, panjang 2 meter siap jahit.', 275000.00, 12, false, 'produk_1788318303_294.jpg', '2026-09-02 01:21:38'),
  (6, 3, 'Kain Batik Indigo Premium', 'Kain batik dengan pewarna indigo alami, tekstur lembut, cocok untuk gaun maupun blazer.', 425000.00, 10, false, 'produk_1788318686_939.jpg', '2026-09-02 01:21:38'),
  (7, 4, 'Selendang Batik Tulis', 'Selendang batik tulis halus, cocok untuk pelengkap kebaya atau acara formal.', 195000.00, 18, false, 'produk_1788318993_212.jpg', '2026-09-02 01:21:38'),
  (8, 4, 'Totebag Kanvas Motif Batik', 'Totebag kanvas dengan cetakan motif batik, kuat dan ramah lingkungan untuk kegiatan sehari-hari.', 120000.00, 29, false, 'produk_1788319117_804.jpg', '2026-09-02 01:21:38'),
  (9, 2, 'Batik Tulis Motif Parang Klasik', 'batik', 554000.00, 23, true, 'produk_1788314695_956.jpg', '2026-09-02 01:32:48'),
  (10, 2, 'Batik Jogja', 'Batik khas Jojga', 265000.00, 27, true, 'produk_1788319353_521.jpg', '2026-09-02 02:27:43'),
  (11, 2, 'Batik Danar Hadi', 'Kain halus dan motif khas Jawa', 448000.00, 25, true, 'produk_1788484847_196.jpg', '2026-09-04 01:20:47')
on conflict (id) do nothing;

insert into produk_ukuran (id, produk_id, ukuran, stok) values
  (1, 11, 'S', 5), (2, 11, 'M', 4), (3, 11, 'L', 6), (4, 11, 'XL', 4), (5, 11, 'XXL', 6),
  (21, 10, 'S', 6), (22, 10, 'M', 9), (23, 10, 'L', 7), (24, 10, 'XL', 3), (25, 10, 'XXL', 2),
  (26, 9, 'S', 3), (27, 9, 'M', 7), (28, 9, 'L', 2), (29, 9, 'XL', 9), (30, 9, 'XXL', 2),
  (31, 2, 'S', 1), (32, 2, 'M', 1), (33, 2, 'L', 0), (34, 2, 'XL', 1), (35, 2, 'XXL', 1),
  (36, 3, 'S', 4), (37, 3, 'M', 7), (38, 3, 'L', 2), (39, 3, 'XL', 2), (40, 3, 'XXL', 1),
  (41, 4, 'S', 5), (42, 4, 'M', 5), (43, 4, 'L', 1), (44, 4, 'XL', 3), (45, 4, 'XXL', 2)
on conflict (id) do nothing;

insert into pesan (id, nama, email, produk_id, jumlah, subjek, ukuran, isi_pesan, status, dibuat_pada) values
  (1, 'patin', 'aldipratamapulung999@gmail.com', NULL, 1, 'Kain Batik Indigo Premium', '', 'pesanhudhjdjbhd', 'Selesai', '2026-09-02 01:33:44'),
  (2, 'patin', 'aldipratamapulung999@gmail.com', NULL, 1, 'Kain Batik Indigo Premium', '', 'pesanhudhjdjbhd', 'Selesai', '2026-09-02 01:33:56'),
  (3, 'Subandi', 'subandi121@gmail.com', NULL, 1, 'Batik Tulis Motif Kawung', 'L', 'untuk bb 51 apakah ukran l pas', 'Selesai', '2026-09-03 01:52:07'),
  (4, 'Abandi', 'abandi@gmail.com', NULL, 1, 'Batik Tulis Motif Kawung', 'XL', 'kainnya bagus', 'Selesai', '2026-09-03 02:07:42'),
  (5, 'Aladin', 'aladin7@gmail.com', 9, 1, 'Batik Tulis Motif Parang Klasik', 'M', 'apakah pesanan saya bisa segera diantar', 'Dibatalkan', '2026-09-04 01:42:59'),
  (6, 'Aziz', 'aziz9999@gmail.com', 2, 1, 'Batik Tulis Motif Kawung', 'L', 'Semoga diantar cepat', 'Diproses', '2026-09-04 06:13:47'),
  (7, 'Hani Budiarti', 'budiarti124@gmail.com', 8, 1, 'Totebag Kanvas Motif Batik', '', 'apakah ini tas seperti modrn', 'Baru', '2026-09-04 06:16:35')
on conflict (id) do nothing;

-- Pastikan auto-increment (sequence) lanjut dari ID tertinggi yang sudah dipakai data awal
select setval(pg_get_serial_sequence('admin', 'id'), (select max(id) from admin));
select setval(pg_get_serial_sequence('kategori', 'id'), (select max(id) from kategori));
select setval(pg_get_serial_sequence('produk', 'id'), (select max(id) from produk));
select setval(pg_get_serial_sequence('produk_ukuran', 'id'), (select max(id) from produk_ukuran));
select setval(pg_get_serial_sequence('pesan', 'id'), (select max(id) from pesan));

-- ---------------------------------------------------------------------
-- FUNGSI (RPC) — pengganti logika kondisional yang dulu ditulis manual
-- di PHP dengan mysqli_stmt_affected_rows(). Dibuat sebagai fungsi
-- database supaya operasi kurangi/kembalikan stok tetap ATOMIK (aman
-- dari race condition saat dua orang pesan bersamaan), persis seperti
-- versi PHP aslinya.
-- ---------------------------------------------------------------------

-- Mengurangi stok produk (tanpa ukuran). Return true kalau stok cukup.
create or replace function kurangi_stok_produk(p_produk_id integer, p_jumlah integer)
returns boolean language plpgsql as $$
declare
  baris_terpengaruh integer;
begin
  update produk set stok = stok - p_jumlah
  where id = p_produk_id and stok >= p_jumlah;

  get diagnostics baris_terpengaruh = row_count;
  return baris_terpengaruh > 0;
end;
$$;

-- Mengembalikan stok produk (tanpa ukuran), dipakai saat pesanan dibatalkan.
create or replace function kembalikan_stok_produk(p_produk_id integer, p_jumlah integer)
returns void language plpgsql as $$
begin
  update produk set stok = stok + p_jumlah where id = p_produk_id;
end;
$$;

-- Menghitung ulang kolom stok utama produk dari total stok semua ukurannya.
create or replace function sinkron_total_stok(p_produk_id integer)
returns void language plpgsql as $$
begin
  update produk
  set stok = coalesce((select sum(stok) from produk_ukuran where produk_id = p_produk_id), 0)
  where id = p_produk_id;
end;
$$;

-- Mengurangi stok untuk ukuran tertentu, lalu sinkron total. Return true kalau stok cukup.
create or replace function kurangi_stok_ukuran(p_produk_id integer, p_ukuran varchar, p_jumlah integer)
returns boolean language plpgsql as $$
declare
  baris_terpengaruh integer;
begin
  update produk_ukuran set stok = stok - p_jumlah
  where produk_id = p_produk_id and ukuran = p_ukuran and stok >= p_jumlah;

  get diagnostics baris_terpengaruh = row_count;

  if baris_terpengaruh > 0 then
    perform sinkron_total_stok(p_produk_id);
  end if;

  return baris_terpengaruh > 0;
end;
$$;

-- Mengembalikan stok ukuran tertentu, dipakai saat pesanan dibatalkan.
create or replace function kembalikan_stok_ukuran(p_produk_id integer, p_ukuran varchar, p_jumlah integer)
returns void language plpgsql as $$
begin
  update produk_ukuran set stok = stok + p_jumlah
  where produk_id = p_produk_id and ukuran = p_ukuran;

  perform sinkron_total_stok(p_produk_id);
end;
$$;

-- Menyimpan stok per ukuran dari form tambah/edit produk admin, lalu sinkron total.
create or replace function simpan_stok_ukuran(
  p_produk_id integer, p_s integer, p_m integer, p_l integer, p_xl integer, p_xxl integer
)
returns void language plpgsql as $$
begin
  insert into produk_ukuran (produk_id, ukuran, stok) values
    (p_produk_id, 'S', p_s), (p_produk_id, 'M', p_m), (p_produk_id, 'L', p_l),
    (p_produk_id, 'XL', p_xl), (p_produk_id, 'XXL', p_xxl)
  on conflict (produk_id, ukuran) do update set stok = excluded.stok;

  perform sinkron_total_stok(p_produk_id);
end;
$$;

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Aplikasi ini mengakses Supabase HANYA dari server (Server Components /
-- Server Actions) memakai SERVICE ROLE KEY, yang otomatis melewati RLS.
-- RLS di bawah ini murni lapisan jaga-jaga kalau suatu saat ada kode yang
-- memakai ANON KEY dari browser -- publik hanya boleh membaca produk &
-- kategori, tidak ada akses tulis langsung dari client.
-- ---------------------------------------------------------------------

alter table admin enable row level security;
alter table kategori enable row level security;
alter table produk enable row level security;
alter table produk_ukuran enable row level security;
alter table pesan enable row level security;

drop policy if exists "publik boleh baca kategori" on kategori;
create policy "publik boleh baca kategori" on kategori for select using (true);

drop policy if exists "publik boleh baca produk" on produk;
create policy "publik boleh baca produk" on produk for select using (true);

drop policy if exists "publik boleh baca stok ukuran" on produk_ukuran;
create policy "publik boleh baca stok ukuran" on produk_ukuran for select using (true);

-- Tabel admin & pesan sengaja TIDAK diberi policy sama sekali untuk anon/publik,
-- artinya hanya bisa diakses lewat service role key di server.
