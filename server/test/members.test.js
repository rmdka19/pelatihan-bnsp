import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';

// Test memakai database terpisah supaya data asli tidak tersentuh.
// Variabel ini harus diset SEBELUM modul db.js diimpor.
process.env.DB_NAME = 'pelatihan_bnsp_test';

const { ensureSchema, pool } = await import('../src/db.js');
const { createApp } = await import('../src/app.js');

let server;
let baseUrl;
let createdId;

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
  await pool.query('DELETE FROM members');
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

test('GET /api/members mengembalikan array kosong saat belum ada data', async () => {
  const { status, body } = await request('/api/members');
  assert.equal(status, 200);
  assert.deepEqual(body, []);
});

test('POST /api/members menolak field kosong dengan pesan per field', async () => {
  const { status, body } = await request('/api/members', {
    method: 'POST',
    body: JSON.stringify({ namaLengkap: '', email: 'bukan-email', posisi: '' }),
  });
  assert.equal(status, 400);
  assert.ok(body.message.length > 0);
  assert.ok(body.errors.namaLengkap);
  assert.ok(body.errors.email);
  assert.ok(body.errors.posisi);
});

test('POST /api/members membuat anggota dengan nilai default', async () => {
  const { status, body } = await request('/api/members', {
    method: 'POST',
    body: JSON.stringify({
      namaLengkap: 'Rina Wijaya',
      email: 'rina.wijaya@perusahaan.com',
      posisi: 'Frontend Dev',
    }),
  });

  assert.equal(status, 201);
  assert.equal(body.namaLengkap, 'Rina Wijaya');
  assert.equal(body.status, 'Online');
  assert.equal(body.rating, 0);
  assert.match(body.id, /^[0-9a-f-]{36}$/);
  assert.match(body.avatar, /^https:\/\/i\.pravatar\.cc\/150\?u=/);
  createdId = body.id;
});

test('GET /api/members memuat anggota yang baru dibuat', async () => {
  const { status, body } = await request('/api/members');
  assert.equal(status, 200);
  assert.equal(body.length, 1);
  assert.equal(body[0].id, createdId);
  assert.equal(body[0].namaLengkap, 'Rina Wijaya');
});

test('PUT /api/members/:id memperbarui data dari form edit', async () => {
  const { status, body } = await request(`/api/members/${createdId}`, {
    method: 'PUT',
    body: JSON.stringify({
      namaLengkap: 'Rina Wijaya Putri',
      email: 'rina.putri@perusahaan.com',
      posisi: 'UI/UX Designer',
    }),
  });

  assert.equal(status, 200);
  assert.equal(body.namaLengkap, 'Rina Wijaya Putri');
  assert.equal(body.posisi, 'UI/UX Designer');
  // nilai yang tidak dikirim tidak berubah
  assert.equal(body.status, 'Online');
  assert.equal(body.rating, 0);
});

test('PUT /api/members/:id menerima pembaruan parsial (status & rating)', async () => {
  const status = await request(`/api/members/${createdId}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'Offline' }),
  });
  assert.equal(status.status, 200);
  assert.equal(status.body.status, 'Offline');

  const rating = await request(`/api/members/${createdId}`, {
    method: 'PUT',
    body: JSON.stringify({ rating: 3 }),
  });
  assert.equal(rating.status, 200);
  assert.equal(rating.body.rating, 3);
});

test('PUT /api/members/:id menolak body kosong dan status tidak dikenal', async () => {
  const kosong = await request(`/api/members/${createdId}`, {
    method: 'PUT',
    body: JSON.stringify({}),
  });
  assert.equal(kosong.status, 400);

  const statusSalah = await request(`/api/members/${createdId}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'Sibuk' }),
  });
  assert.equal(statusSalah.status, 400);
});

test('PUT /api/members/:id mengembalikan 404 untuk id yang tidak ada', async () => {
  const { status } = await request('/api/members/tidak-ada', {
    method: 'PUT',
    body: JSON.stringify({ namaLengkap: 'Nama Baru' }),
  });
  assert.equal(status, 404);
});

test('DELETE /api/members/:id menghapus anggota', async () => {
  const hapus = await request(`/api/members/${createdId}`, { method: 'DELETE' });
  assert.equal(hapus.status, 204);

  const daftar = await request('/api/members');
  assert.equal(daftar.status, 200);
  assert.equal(daftar.body.length, 0);
});

test('DELETE /api/members/:id mengembalikan 404 bila sudah tidak ada', async () => {
  const { status } = await request(`/api/members/${createdId}`, { method: 'DELETE' });
  assert.equal(status, 404);
});

