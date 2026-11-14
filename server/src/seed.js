import { ensureSchema, pool } from './db.js';

// Data awal sesuai spesifikasi pelatihan. Idempoten: data yang sudah ada
// (termasuk hasil edit user) tidak ditimpa.
const SEED_MEMBERS = [
  {
    id: '1',
    namaLengkap: 'Budi Santoso',
    email: 'budi.santoso@perusahaan.com',
    posisi: 'Frontend Dev',
    status: 'Online',
    rating: 2,
    avatar: 'https://i.pravatar.cc/150?u=1',
  },
  {
    id: '2',
    namaLengkap: 'Siti Rahma',
    email: 'siti.rahma@perusahaan.com',
    posisi: 'UI/UX Designer',
    status: 'Offline',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=2',
  },
  {
    id: '3',
    namaLengkap: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@perusahaan.com',
    posisi: 'Backend Engineer',
    status: 'Online',
    rating: 1,
    avatar: 'https://i.pravatar.cc/150?u=3',
  },
];

// Bagian 1 praktik: data kategori dan minimal 5 barang awal.
const SEED_KATEGORI = ['Elektronik', 'ATK', 'Makanan', 'Minuman', 'Pakaian'];

const SEED_BARANG = [
  { nama: 'Laptop Belajar', kategori: 'Elektronik', stok: 8 },
  { nama: 'Mouse Wireless', kategori: 'Elektronik', stok: 25 },
  { nama: 'Pulpen Gel', kategori: 'ATK', stok: 100 },
  { nama: 'Buku Tulis', kategori: 'ATK', stok: 60 },
  { nama: 'Kopi Sachet', kategori: 'Makanan', stok: 40 },
  { nama: 'Air Mineral', kategori: 'Minuman', stok: 50 },
  { nama: 'Kaos Pelatihan', kategori: 'Pakaian', stok: 15 },
];

await ensureSchema();

for (const member of SEED_MEMBERS) {
  await pool.query(
    `INSERT IGNORE INTO members (id, nama_lengkap, email, posisi, status, rating, avatar)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      member.id,
      member.namaLengkap,
      member.email,
      member.posisi,
      member.status,
      member.rating,
      member.avatar,
    ]
  );
}

for (const nama of SEED_KATEGORI) {
  await pool.query('INSERT IGNORE INTO kategori (nama) VALUES (?)', [nama]);
}

const [kategoriRows] = await pool.query('SELECT id, nama FROM kategori');
const kategoriIdByName = Object.fromEntries(
  kategoriRows.map((row) => [row.nama, row.id])
);

for (const barang of SEED_BARANG) {
  const [ada] = await pool.query('SELECT id FROM barang WHERE nama = ? LIMIT 1', [
    barang.nama,
  ]);
  if (ada.length > 0) continue;

  const kategoriId = kategoriIdByName[barang.kategori];
  if (!kategoriId) {
    throw new Error(`Kategori "${barang.kategori}" tidak ditemukan saat seed`);
  }

  await pool.query(
    'INSERT INTO barang (nama, kategori_id, stok) VALUES (?, ?, ?)',
    [barang.nama, kategoriId, barang.stok]
  );
}

const [rows] = await pool.query('SELECT COUNT(*) AS total FROM members');
const [kategoriCount] = await pool.query('SELECT COUNT(*) AS total FROM kategori');
const [barangCount] = await pool.query('SELECT COUNT(*) AS total FROM barang');
console.log(
  `Seed selesai. Anggota: ${rows[0].total}, kategori: ${kategoriCount[0].total}, barang: ${barangCount[0].total}.`
);

await pool.end();

