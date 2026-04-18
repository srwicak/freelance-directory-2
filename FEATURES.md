# FreelancerID — Feature Reference

Dokumen ini mencatat semua fitur yang ditemukan di aplikasi lama (Next.js), status implementasinya di aplikasi baru (SvelteKit), dan fitur tambahan.

---

## Fitur dari Aplikasi Lama (Next.js)

| # | Fitur | Status |
|---|-------|--------|
| 1 | Registrasi multi-step (3 langkah) | ✅ Diimplementasikan |
| 2 | ID 10 karakter sebagai akses (tanpa password) | ✅ Diimplementasikan |
| 3 | Enkripsi AES-256-GCM untuk nama, LinkedIn, details, portfolio | ✅ Diimplementasikan |
| 4 | Direktori freelancer dengan pencarian + filter bidang | ✅ Diimplementasikan |
| 5 | Pagination (load more) di direktori | ✅ Diimplementasikan |
| 6 | Detail kontak (LinkedIn, portfolio) tersembunyi untuk non-member | ✅ Diimplementasikan |
| 7 | Modal autentikasi dengan ID untuk buka kontak | ✅ Diimplementasikan |
| 8 | Filter berdasarkan bidang keahlian (37 kategori) | ✅ Diimplementasikan |
| 9 | 38 provinsi + kota/kabupaten Indonesia | ✅ Diimplementasikan |
| 10 | Sub-spesialisasi opsional di profil | ✅ Diimplementasikan |
| 11 | Bio/details di profil (terenkripsi) | ✅ Diimplementasikan |
| 12 | Portfolio URL di profil (terenkripsi) | ✅ Diimplementasikan |
| 13 | Edit profil (nama, LinkedIn, lokasi, bidang, bio, portfolio) | ✅ Diimplementasikan |
| 14 | Papan lowongan dengan dua tab: JOB (Butuh Freelancer) & TALENT (Tawarkan Jasa) | ✅ Diimplementasikan |
| 15 | Buat postingan dengan judul, deskripsi, kategori, gambar, durasi | ✅ Diimplementasikan |
| 16 | Durasi postingan 1–14 hari | ✅ Diimplementasikan |
| 17 | Batas 3 postingan aktif per pengguna | ✅ Diimplementasikan |
| 18 | Edit postingan (maks 3 kali) | ✅ Diimplementasikan |
| 19 | Hapus postingan milik sendiri | ✅ Diimplementasikan |
| 20 | Sistem voting thumbs-up / thumbs-down | ✅ Diimplementasikan |
| 21 | Toggle vote (klik dua kali = batal vote) | ✅ Diimplementasikan |
| 22 | Switch vote (dari up ke down atau sebaliknya) | ✅ Diimplementasikan |
| 23 | Badge "Trusted" (≥25 thumbs-up) | ✅ Diimplementasikan |
| 24 | Badge "Populer" (≥10 thumbs-up) | ✅ Diimplementasikan |
| 25 | Badge "Warning" kuning (≥5 thumbs-down) | ✅ Diimplementasikan |
| 26 | Badge "Warning" merah (≥10 thumbs-down) | ✅ Diimplementasikan |
| 27 | Border merah/kuning pada kartu postingan berdasarkan warning | ✅ Diimplementasikan |
| 28 | Tampilan info pembuat postingan (nama, field, lokasi) | ✅ Diimplementasikan |
| 29 | Kontak pembuat postingan (LinkedIn, portfolio) hanya untuk member | ✅ Diimplementasikan |
| 30 | Filter bidang di papan lowongan | ✅ Diimplementasikan |
| 31 | Pagination load more di papan lowongan | ✅ Diimplementasikan |
| 32 | Detail postingan dengan halaman tersendiri | ✅ Diimplementasikan |
| 33 | Debounce pencarian 300ms | ✅ Diimplementasikan |
| 34 | Landing page dengan hero section & fitur | ✅ Diimplementasikan |
| 35 | Navbar responsif dengan state login | ✅ Diimplementasikan |
| 36 | Logout dari perangkat | ✅ Diimplementasikan |
| 37 | Auth state dari localStorage | ✅ Diimplementasikan |
| 38 | Verifikasi ID saat login (cek ke database) | ✅ Diimplementasikan |

---

## Fitur Tambahan (Baru di Versi SvelteKit)

| # | Fitur Tambahan | Keterangan |
|---|----------------|------------|
| 1 | **Avatar berwarna otomatis** | Warna avatar di direktori digenerate dari hash user ID (6 warna, konsisten per user) |
| 2 | **Skeleton loading state** | Placeholder animasi di direktori dan papan lowongan saat data dimuat |
| 3 | **Counter karakter di form** | Semua textarea menampilkan hitungan karakter real-time (e.g. 150/1000) |
| 4 | **Masuk via prompt "Sudah punya ID?"** | Di halaman register ada tautan langsung untuk masuk dengan ID yang sudah ada |
| 5 | **Info sisa edit di modal edit** | Menampilkan berapa edit tersisa (e.g. "2 edit tersisa") langsung di header modal |
| 6 | **Durasi tayang dengan range slider** | Pemilihan durasi 1–14 hari menggunakan slider intuitif bukan input angka |
| 7 | **Logout dengan konfirmasi zona bahaya** | Tombol logout di edit profil diberi label "Zona Bahaya" agar tidak tidak sengaja diklik |
| 8 | **Notifikasi sukses edit profil** | Banner hijau muncul selama 3 detik setelah berhasil menyimpan profil |
| 9 | **Stats di hero page** | Menampilkan angka 38 Provinsi, 37+ Kategori, 100% Gratis |
| 10 | **Salin ID ke clipboard** | Tombol "Salin ID" di halaman sukses registrasi dengan feedback visual "Tersalin!" |
| 11 | **Avatar inisial dari nama** | Kartu direktori menampilkan 2 huruf pertama nama sebagai avatar |
| 12 | **"Buat yang pertama"** | Papan lowongan kosong menampilkan CTA untuk membuat postingan pertama |
| 13 | **Reset filter** | Tombol reset filter muncul saat pencarian/filter aktif tapi tidak ada hasil |
| 14 | **Deployed ke Cloudflare Pages via SvelteKit adapter** | Menggunakan `@sveltejs/adapter-cloudflare` — lebih ringan, tidak perlu OpenNextJS |

---

## Tech Stack Perbandingan

| Aspek | Aplikasi Lama | Aplikasi Baru |
|-------|--------------|---------------|
| Framework | Next.js 16 (App Router) | SvelteKit 2 |
| Deployment adapter | @opennextjs/cloudflare | @sveltejs/adapter-cloudflare |
| Styling | Tailwind CSS 4 + Radix UI | Tailwind CSS 4 (native, tanpa komponen eksternal) |
| Animasi | Framer Motion | CSS transitions bawaan |
| Database | Turso (LibSQL via HTTP) | Turso (LibSQL via HTTP) — sama |
| ORM | Drizzle ORM | Drizzle ORM — sama |
| Enkripsi | AES-256-GCM (Web Crypto API) | AES-256-GCM (Web Crypto API) — sama |
| Auth | ID-based (localStorage) | ID-based (localStorage) — sama |
| Icons | Lucide React | SVG inline (zero dependency) |
| Bundle size | Lebih besar (React + Framer) | Lebih kecil (Svelte compiler) |

---

## Struktur Database (Tidak Berubah)

```sql
-- Tabel utama pengguna
CREATE TABLE freelancers (
  id         TEXT PRIMARY KEY,        -- 10-char nanoid
  name       TEXT NOT NULL,           -- terenkripsi AES-256
  field      TEXT NOT NULL,           -- tidak terenkripsi (untuk filter)
  sub_field  TEXT,                    -- opsional
  province   TEXT NOT NULL,           -- tidak terenkripsi (untuk filter)
  city       TEXT NOT NULL,
  details    TEXT,                    -- terenkripsi
  portfolio  TEXT,                    -- terenkripsi
  linkedin   TEXT NOT NULL,           -- terenkripsi
  created_at INTEGER DEFAULT (unixepoch())
);

-- Postingan lowongan / jasa
CREATE TABLE opportunities (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES freelancers(id),
  type        TEXT NOT NULL,          -- 'JOB' | 'TALENT'
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  field       TEXT,                   -- kategori opsional
  image_url   TEXT,                   -- opsional
  created_at  INTEGER,
  expires_at  INTEGER,                -- unix timestamp kedaluwarsa
  edit_count  INTEGER DEFAULT 0,      -- maks 3
  thumbs_up   INTEGER DEFAULT 0,
  thumbs_down INTEGER DEFAULT 0
);

-- Vote per user per postingan
CREATE TABLE opportunity_votes (
  id              TEXT PRIMARY KEY,
  opportunity_id  TEXT REFERENCES opportunities(id),
  user_id         TEXT REFERENCES freelancers(id),
  value           INTEGER NOT NULL    -- 1 atau -1
);
```

---

## Cara Menjalankan

```bash
# Clone / masuk ke folder
cd freelancer-sv

# Install dependencies
npm install

# Buat file .dev.vars
cp .dev.vars.example .dev.vars
# Isi TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, ENCRYPTION_KEY

# Dev server lokal
npm run dev

# Build production
npm run build

# Preview production lokal
npm run preview

# Deploy ke Cloudflare Pages
npm run cf:deploy

# Push schema ke Turso
npm run db:push
```

### Environment Variables (.dev.vars)
```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
ENCRYPTION_KEY=your-32-byte-hex-key
```
