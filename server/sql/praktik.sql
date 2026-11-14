-- ============================================================
-- PRAKTIK BAGIAN 1: DATABASE RELASIONAL & SQL
-- Database : pelatihan_bnsp
-- Tabel    : kategori (induk) 1 ── N barang (anak)
-- Cara pakai:
--   1. Jalankan MySQL Laragon.
--   2. Isi data awal: npm run seed
--   3. Buka file ini di HeidiSQL / phpMyAdmin / MySQL client,
--      lalu jalankan query satu per satu (blok per blok).
-- Catatan: contoh UPDATE/DELETE dan uji gagal dibungkus
--          START TRANSACTION ... ROLLBACK agar data asli aman.
-- ============================================================

USE pelatihan_bnsp;

-- ------------------------------------------------------------
-- LANGKAH 1: Struktur tabel (DDL)
-- Tabel biasanya sudah dibuat otomatis oleh server (ensureSchema).
-- IF NOT EXISTS membuat blok ini aman dijalankan berulang.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kategori (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_kategori_nama (nama)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS barang (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(120) NOT NULL,
  kategori_id INT UNSIGNED NOT NULL,
  stok INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_barang_kategori FOREIGN KEY (kategori_id)
    REFERENCES kategori (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_barang_stok CHECK (stok >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- LANGKAH 2: Data awal
-- Dijalankan lewat `npm run seed` (idempoten, aman berulang).
-- Cek hasilnya dengan query berikut.
-- ------------------------------------------------------------

SELECT * FROM kategori;

-- Minimal 5 barang sesuai draf.
SELECT * FROM barang;

-- ------------------------------------------------------------
-- LANGKAH 3a: SELECT — semua kolom
-- ------------------------------------------------------------

SELECT * FROM barang;

-- SELECT kolom tertentu saja
SELECT id, nama, stok FROM barang;

-- ------------------------------------------------------------
-- LANGKAH 3b: WHERE — menyaring baris
-- ------------------------------------------------------------

-- Barang dengan stok habis
SELECT id, nama, stok FROM barang WHERE stok = 0;

-- Barang dengan stok menipis (1 sampai 10)
SELECT id, nama, stok FROM barang WHERE stok BETWEEN 1 AND 10;

-- Barang yang namanya mengandung kata "Laptop"
SELECT id, nama, stok FROM barang WHERE nama LIKE '%Laptop%';

-- Barang dari satu kategori (kategori "ATK" diasumsikan id = 2;
-- sesuaikan dengan hasil SELECT * FROM kategori)
SELECT id, nama, stok FROM barang WHERE kategori_id = 2;

-- ------------------------------------------------------------
-- LANGKAH 3c: ORDER BY — mengurutkan hasil
-- ------------------------------------------------------------

-- Stok paling sedikit lebih dulu
SELECT id, nama, stok FROM barang ORDER BY stok ASC;

-- Stok paling banyak lebih dulu
SELECT id, nama, stok FROM barang ORDER BY stok DESC;

-- Urut nama A-Z
SELECT id, nama FROM barang ORDER BY nama ASC;

-- ------------------------------------------------------------
-- LANGKAH 3d: UPDATE — mengubah data (contoh aman: dibatalkan)
-- ------------------------------------------------------------

START TRANSACTION;

-- Tambah stok 5 untuk barang bernama 'Laptop Belajar'
UPDATE barang
SET stok = stok + 5
WHERE nama = 'Laptop Belajar';

-- Lihat hasil sementara di dalam transaksi
SELECT id, nama, stok FROM barang WHERE nama = 'Laptop Belajar';

-- Batalkan supaya data asli tidak berubah.
-- Ganti ROLLBACK menjadi COMMIT bila ingin menyimpan perubahan.
ROLLBACK;

-- ------------------------------------------------------------
-- LANGKAH 3e: DELETE — menghapus data (contoh aman: dibatalkan)
-- ------------------------------------------------------------

START TRANSACTION;

-- Hapus barang dengan stok 0 (biasanya tidak ada di data seed)
DELETE FROM barang WHERE stok = 0;

-- Lihat sisa data di dalam transaksi
SELECT id, nama, stok FROM barang ORDER BY id;

ROLLBACK;

-- ------------------------------------------------------------
-- LANGKAH 4: JOIN — barang beserta nama kategorinya
-- ------------------------------------------------------------

-- INNER JOIN: hanya baris yang punya pasangan di kedua tabel.
-- Inilah query yang dipakai endpoint GET /api/barang.
SELECT
  b.id,
  b.nama AS nama_barang,
  k.nama AS nama_kategori,
  b.stok
FROM barang b
JOIN kategori k ON k.id = b.kategori_id
ORDER BY b.id ASC;

-- LEFT JOIN: semua kategori tetap tampil walau belum punya barang.
SELECT
  k.id,
  k.nama AS nama_kategori,
  COUNT(b.id) AS jumlah_barang
FROM kategori k
LEFT JOIN barang b ON b.kategori_id = k.id
GROUP BY k.id, k.nama
ORDER BY k.nama ASC;

-- ------------------------------------------------------------
-- LANGKAH 5a: UJI FOREIGN KEY
-- Insert kategori_id yang tidak ada di tabel kategori harus GAGAL
-- dengan error 1452 (Cannot add or update a child row).
-- ------------------------------------------------------------

START TRANSACTION;

INSERT INTO barang (nama, kategori_id, stok)
VALUES ('Barang Uji FK', 999999, 1);
-- ERROR 1452: foreign key constraint fails.

ROLLBACK;

-- ------------------------------------------------------------
-- LANGKAH 5b: UJI CHECK CONSTRAINT
-- Stok negatif harus GAGAL dengan error 3819
-- (Check constraint 'chk_barang_stok' is violated).
-- ------------------------------------------------------------

START TRANSACTION;

INSERT INTO barang (nama, kategori_id, stok)
VALUES ('Barang Stok Negatif', 1, -5);
-- ERROR 3819: check constraint violated.

ROLLBACK;

-- ------------------------------------------------------------
-- UJI TAMBAHAN: kategori tidak bisa dihapus selama masih dipakai
-- (ON DELETE RESTRICT). Ganti 1 dengan id kategori yang punya barang.
-- ------------------------------------------------------------

START TRANSACTION;

DELETE FROM kategori WHERE id = 1;
-- ERROR 1451: Cannot delete or update a parent row.

ROLLBACK;

