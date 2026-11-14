import mysql from 'mysql2/promise';

const connectionConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

export const dbName = process.env.DB_NAME || 'pelatihan_bnsp';

// Pool dipakai seluruh route. Koneksi fisik baru dibuat saat query pertama.
export const pool = mysql.createPool({
  ...connectionConfig,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
});

// Membuat database & tabel bila belum ada — aman dijalankan berulang kali.
export async function ensureSchema() {
  const admin = await mysql.createConnection(connectionConfig);
  try {
    await admin.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await admin.end();
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS members (
      id CHAR(36) NOT NULL PRIMARY KEY,
      nama_lengkap VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL,
      posisi VARCHAR(80) NOT NULL,
      status ENUM('Online', 'Offline') NOT NULL DEFAULT 'Online',
      rating INT NOT NULL DEFAULT 0,
      avatar VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Relasi satu kategori ke banyak barang (foreign key).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS kategori (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(80) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_kategori_nama (nama)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

