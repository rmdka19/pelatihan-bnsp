import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';

// Test memakai database terpisah supaya data asli tidak tersentuh.
// Variabel ini harus diset SEBELUM modul db.js diimpor.
process.env.DB_NAME = 'pelatihan_bnsp_test';

const { ensureSchema, pool } = await import('../src/db.js');
const { createApp } = await import('../src/app.js');

let server;
let baseUrl;
let kategori = {};
let barangId;

async function request(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = res.status === 204 ? null : await res.json();
  return { status: res.status, body };
}

before(async () => {
  await ensureSchema();

  // Hapus anak (barang) lebih dulu karena foreign key.
  await pool.query('DELETE FROM barang');
  await pool.query('DELETE FROM kategori');

  await pool.query(
    "INSERT INTO kategori (nama) VALUES ('Elektronik'), ('ATK'), ('Makanan')"
  );

  const [rows] = await pool.query('SELECT id, nama FROM kategori');
  kategori = Object.fromEntries(rows.map((row) => [row.nama.toLowerCase(), row.id]));

  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

test('GET /api/kategori mengembalikan daftar kategori', async () => {
  const { status, body } = await request('/api/kategori');

  assert.equal(status, 200);
  assert.equal(body.length, 3);
  assert.ok(body.every((item) => item.id > 0 && item.nama));
});

test('GET /api/barang mengembalikan array kosong saat belum ada data', async () => {
  const { status, body } = await request('/api/barang');

  assert.equal(status, 200);
  assert.deepEqual(body, []);
});

test('POST /api/barang menolak nama kosong dan stok negatif', async () => {
  const { status, body } = await request('/api/barang', {
    method: 'POST',
    body: JSON.stringify({ nama: '', kategoriId: kategori.elektronik, stok: -1 }),
  });

  assert.equal(status, 400);
  assert.ok(body.errors.nama);
  assert.ok(body.errors.stok);
});

test('POST /api/barang menolak kategori yang tidak ada', async () => {
  const { status, body } = await request('/api/barang', {
    method: 'POST',
    body: JSON.stringify({
      nama: 'Barang Tanpa Kategori',
      kategoriId: 999999,
      stok: 1,
    }),
  });

  assert.equal(status, 400);
  assert.ok(body.errors.kategoriId);
});

test('POST /api/barang menolak stok yang bukan bilangan bulat', async () => {
  const { status, body } = await request('/api/barang', {
    method: 'POST',
    body: JSON.stringify({
      nama: 'Mouse Wireless',
      kategoriId: kategori.elektronik,
      stok: 1.5,
    }),
  });

  assert.equal(status, 400);
  assert.ok(body.errors.stok);
});

test('POST /api/barang membuat barang baru beserta nama kategorinya', async () => {
  const { status, body } = await request('/api/barang', {
    method: 'POST',
    body: JSON.stringify({
      nama: 'Laptop Belajar',
      kategoriId: kategori.elektronik,
      stok: 8,
    }),
  });

  assert.equal(status, 201);
  assert.ok(Number.isInteger(body.id));
  assert.equal(body.nama, 'Laptop Belajar');
  assert.equal(body.kategoriId, kategori.elektronik);
  assert.equal(body.kategori, 'Elektronik');
  assert.equal(body.stok, 8);
  barangId = body.id;
});

test('GET /api/barang menampilkan barang dengan nama kategori (JOIN)', async () => {
  const { status, body } = await request('/api/barang');

  assert.equal(status, 200);
  assert.equal(body.length, 1);
  assert.equal(body[0].id, barangId);
  assert.equal(body[0].kategori, 'Elektronik');
});

test('GET /api/barang/:id menampilkan satu barang', async () => {
  const { status, body } = await request(`/api/barang/${barangId}`);

  assert.equal(status, 200);
  assert.equal(body.nama, 'Laptop Belajar');
});

test('PUT /api/barang/:id memperbarui nama dan stok', async () => {
  const { status, body } = await request(`/api/barang/${barangId}`, {
    method: 'PUT',
    body: JSON.stringify({ nama: 'Laptop Praktik', stok: 12 }),
  });

  assert.equal(status, 200);
  assert.equal(body.nama, 'Laptop Praktik');
  assert.equal(body.stok, 12);
  assert.equal(body.kategori, 'Elektronik');
});

test('PATCH /api/barang/:id menerima pembaruan sebagian', async () => {
  const { status, body } = await request(`/api/barang/${barangId}`, {
    method: 'PATCH',
    body: JSON.stringify({ stok: 20 }),
  });

  assert.equal(status, 200);
  assert.equal(body.stok, 20);
  assert.equal(body.nama, 'Laptop Praktik');
});

test('PUT /api/barang/:id menolak kategori yang tidak ada', async () => {
  const { status, body } = await request(`/api/barang/${barangId}`, {
    method: 'PUT',
    body: JSON.stringify({ kategoriId: 999999 }),
  });

  assert.equal(status, 400);
  assert.ok(body.errors.kategoriId);
});

test('PUT /api/barang/:id mengembalikan 404 untuk id yang tidak ada', async () => {
  const { status } = await request('/api/barang/999999', {
    method: 'PUT',
    body: JSON.stringify({ stok: 1 }),
  });

  assert.equal(status, 404);
});

test('GET /api/barang/:id menolak id yang bukan angka', async () => {
  const { status } = await request('/api/barang/abc');

  assert.equal(status, 400);
});

test('DELETE /api/barang/:id menghapus barang', async () => {
  const hapus = await request(`/api/barang/${barangId}`, { method: 'DELETE' });
  assert.equal(hapus.status, 204);

  const daftar = await request('/api/barang');
  assert.equal(daftar.status, 200);
  assert.deepEqual(daftar.body, []);
});

test('DELETE /api/barang/:id mengembalikan 404 bila sudah tidak ada', async () => {
  const { status } = await request(`/api/barang/${barangId}`, { method: 'DELETE' });

  assert.equal(status, 404);
});

test('CORS mengizinkan origin frontend React', async () => {
  const res = await fetch(`${baseUrl}/api/barang`, {
    headers: { Origin: 'http://localhost:5173' },
  });

  assert.equal(res.status, 200);
  assert.equal(
    res.headers.get('access-control-allow-origin'),
    'http://localhost:5173'
  );
});

test('CORS menjawab preflight OPTIONS untuk POST', async () => {
  const res = await fetch(`${baseUrl}/api/barang`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:5173',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  });

  assert.equal(res.status, 204);
  assert.equal(
    res.headers.get('access-control-allow-origin'),
    'http://localhost:5173'
  );
  assert.match(res.headers.get('access-control-allow-methods') ?? '', /POST/);
});

