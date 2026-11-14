import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyBarangForm, validateBarangForm } from './barangForm.js';

test('menolak nama barang yang kosong', () => {
  const result = validateBarangForm({
    ...emptyBarangForm,
    kategoriId: '1',
    stok: '5',
  });

  assert.equal(result.errors.nama, 'Nama barang wajib diisi');
});

test('menolak kategori yang belum dipilih', () => {
  const result = validateBarangForm({
    nama: 'Laptop',
    kategoriId: '',
    stok: '5',
  });

  assert.equal(result.errors.kategoriId, 'Kategori wajib dipilih');
});

test('menolak stok kosong', () => {
  const result = validateBarangForm({
    nama: 'Laptop',
    kategoriId: '1',
    stok: '',
  });

  assert.equal(result.errors.stok, 'Stok harus berupa angka');
});

test('menolak stok negatif', () => {
  const result = validateBarangForm({
    nama: 'Laptop',
    kategoriId: '1',
    stok: '-1',
  });

  assert.equal(result.errors.stok, 'Stok tidak boleh negatif');
});

test('menolak stok pecahan', () => {
  const result = validateBarangForm({
    nama: 'Laptop',
    kategoriId: '1',
    stok: '2.5',
  });

  assert.equal(result.errors.stok, 'Stok harus bilangan bulat');
});

test('mengubah isian form (string) menjadi payload angka', () => {
  const result = validateBarangForm({
    nama: '  Laptop Belajar  ',
    kategoriId: '2',
    stok: '8',
  });

  assert.deepEqual(result.data, {
    nama: 'Laptop Belajar',
    kategoriId: 2,
    stok: 8,
  });
});

