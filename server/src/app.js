import cors from 'cors';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { pool } from './db.js';
import {
  createBarangSchema,
  createMemberSchema,
  updateBarangSchema,
  updateMemberSchema,
} from './schema.js';

const COLUMNS = 'id, nama_lengkap, email, posisi, status, rating, avatar';

const BARANG_COLUMNS = 'b.id, b.nama, b.kategori_id, k.nama AS kategori, b.stok';

// Pemetaan kolom snake_case (MySQL) → field camelCase (kontrak API/frontend)
function mapRow(row) {
  return {
    id: row.id,
    namaLengkap: row.nama_lengkap,
    email: row.email,
    posisi: row.posisi,
    status: row.status,
    rating: row.rating,
    avatar: row.avatar,
  };
}

function mapBarangRow(row) {
  return {
    id: row.id,
    nama: row.nama,
    kategoriId: row.kategori_id,
    kategori: row.kategori,
    stok: row.stok,
  };
}

// ID dari URL harus bilangan bulat positif; selain itu dianggap tidak valid.
function parseId(value) {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function findBarangById(id) {
  const [rows] = await pool.query(
    `SELECT ${BARANG_COLUMNS} FROM barang b
     JOIN kategori k ON k.id = b.kategori_id
     WHERE b.id = ?`,
    [id]
  );
  return rows.length > 0 ? mapBarangRow(rows[0]) : null;
}

async function kategoriExists(id) {
  const [rows] = await pool.query('SELECT id FROM kategori WHERE id = ?', [id]);
  return rows.length > 0;
}

// Express 5 meneruskan error async otomatis; helper ini menjaga kompatibilitas Express 4.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

function validate(schema, body) {
  const result = schema.safeParse(body);
  if (result.success) return { data: result.data };

  const errors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field !== undefined && errors[field] === undefined) {
      errors[field] = issue.message;
    }
  }

  return { errors, message: result.error.issues[0].message };
}

export function createApp() {
  const app = express();

  // Bagian 4: izinkan frontend dari origin (port) berbeda.
  // Default: Vite dev di localhost/127.0.0.1 port 5173.
  // Ubah lewat CORS_ORIGIN di .env (pisahkan dengan koma bila lebih dari satu).
  const allowedOrigins = (
    process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json());

  // Daftar anggota (urut dari yang paling lama agar seed tampil sesuai spesifikasi)
  app.get(
    '/api/members',
    asyncHandler(async (req, res) => {
      const [rows] = await pool.query(
        `SELECT ${COLUMNS} FROM members ORDER BY created_at ASC, id ASC`
      );
      res.json(rows.map(mapRow));
    })
  );

  // Tambah anggota: id, status, rating, dan avatar ditentukan server
  app.post(
    '/api/members',
    asyncHandler(async (req, res) => {
      const parsed = validate(createMemberSchema, req.body);
      if (parsed.errors) {
        return res.status(400).json({
          message: parsed.message,
          errors: parsed.errors,
        });
      }

      const id = randomUUID();
      const member = {
        id,
        ...parsed.data,
        status: 'Online',
        rating: 0,
        avatar: `https://i.pravatar.cc/150?u=${id}`,
      };

      await pool.query(
        `INSERT INTO members (id, nama_lengkap, email, posisi, status, rating, avatar)
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

      res.status(201).json(member);
    })
  );

  // Ubah anggota (body boleh sebagian)
  app.put(
    '/api/members/:id',
    asyncHandler(async (req, res) => {
      const parsed = validate(updateMemberSchema, req.body);
      if (parsed.errors) {
        return res.status(400).json({
          message: parsed.message,
          errors: parsed.errors,
        });
      }

      const columnByField = {
        namaLengkap: 'nama_lengkap',
        email: 'email',
        posisi: 'posisi',
        status: 'status',
        rating: 'rating',
      };

      const assignments = [];
      const values = [];
      for (const [field, column] of Object.entries(columnByField)) {
        if (parsed.data[field] !== undefined) {
          assignments.push(`${column} = ?`);
          values.push(parsed.data[field]);
        }
      }

      await pool.query(`UPDATE members SET ${assignments.join(', ')} WHERE id = ?`, [
        ...values,
        req.params.id,
      ]);

      const [rows] = await pool.query(
        `SELECT ${COLUMNS} FROM members WHERE id = ?`,
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Anggota tim tidak ditemukan' });
      }

      res.json(mapRow(rows[0]));
    })
  );

  // Hapus anggota
  app.delete(
    '/api/members/:id',
    asyncHandler(async (req, res) => {
      const [result] = await pool.query('DELETE FROM members WHERE id = ?', [
        req.params.id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Anggota tim tidak ditemukan' });
      }

      res.status(204).end();
    })
  );

  // Daftar kategori (dipakai untuk dropdown form barang)
  app.get(
    '/api/kategori',
    asyncHandler(async (req, res) => {
      const [rows] = await pool.query(
        'SELECT id, nama FROM kategori ORDER BY nama ASC'
      );
      res.json(rows);
    })
  );

  // Daftar barang + nama kategori (query JOIN)
  app.get(
    '/api/barang',
    asyncHandler(async (req, res) => {
      const [rows] = await pool.query(
        `SELECT ${BARANG_COLUMNS} FROM barang b
         JOIN kategori k ON k.id = b.kategori_id
         ORDER BY b.id ASC`
      );
      res.json(rows.map(mapBarangRow));
    })
  );

  app.get(
    '/api/barang/:id',
    asyncHandler(async (req, res) => {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: 'ID barang harus berupa angka positif' });
      }

      const barang = await findBarangById(id);
      if (!barang) {
        return res.status(404).json({ message: 'Barang tidak ditemukan' });
      }

      res.json(barang);
    })
  );

  // Tambah barang: nama wajib, stok bilangan bulat >= 0, kategori harus ada.
  app.post(
    '/api/barang',
    asyncHandler(async (req, res) => {
      const parsed = validate(createBarangSchema, req.body);
      if (parsed.errors) {
        return res.status(400).json({
          message: parsed.message,
          errors: parsed.errors,
        });
      }

      if (!(await kategoriExists(parsed.data.kategoriId))) {
        return res.status(400).json({
          message: 'Kategori tidak ditemukan',
          errors: { kategoriId: 'Kategori tidak ditemukan' },
        });
      }

      const [result] = await pool.query(
        'INSERT INTO barang (nama, kategori_id, stok) VALUES (?, ?, ?)',
        [parsed.data.nama, parsed.data.kategoriId, parsed.data.stok]
      );

      res.status(201).json(await findBarangById(result.insertId));
    })
  );

  // PUT dan PATCH memakai handler yang sama (body boleh sebagian).
  const updateBarang = asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'ID barang harus berupa angka positif' });
    }

    const parsed = validate(updateBarangSchema, req.body);
    if (parsed.errors) {
      return res.status(400).json({
        message: parsed.message,
        errors: parsed.errors,
      });
    }

    const existing = await findBarangById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    if (parsed.data.kategoriId !== undefined && !(await kategoriExists(parsed.data.kategoriId))) {
      return res.status(400).json({
        message: 'Kategori tidak ditemukan',
        errors: { kategoriId: 'Kategori tidak ditemukan' },
      });
    }

    const columnByField = { nama: 'nama', kategoriId: 'kategori_id', stok: 'stok' };
    const assignments = [];
    const values = [];
    for (const [field, column] of Object.entries(columnByField)) {
      if (parsed.data[field] !== undefined) {
        assignments.push(`${column} = ?`);
        values.push(parsed.data[field]);
      }
    }

    await pool.query(`UPDATE barang SET ${assignments.join(', ')} WHERE id = ?`, [
      ...values,
      id,
    ]);

    res.json(await findBarangById(id));
  });

  app.put('/api/barang/:id', updateBarang);
  app.patch('/api/barang/:id', updateBarang);

  app.delete(
    '/api/barang/:id',
    asyncHandler(async (req, res) => {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: 'ID barang harus berupa angka positif' });
      }

      const [result] = await pool.query('DELETE FROM barang WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Barang tidak ditemukan' });
      }

      res.status(204).end();
    })
  );

  app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint tidak ditemukan' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ message: 'Body JSON tidak valid' });
    }
    console.error('[server] Kesalahan tak terduga:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  });

  return app;
}

