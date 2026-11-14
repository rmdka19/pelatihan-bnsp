import { z } from 'zod';

// Nilai input HTML selalu string; kosong/null diubah menjadi undefined
// supaya pesan "wajib diisi" tetap muncul (bukan dianggap angka 0).
function toNumber(value) {
  if (value === '' || value === null || value === undefined) return undefined;
  return Number(value);
}

// Skema validasi antarmuka (frontend) — pesannya sengaja sama dengan backend.
const barangSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(1, 'Nama barang wajib diisi')
    .max(120, 'Nama barang maksimal 120 karakter'),
  kategoriId: z.preprocess(
    toNumber,
    z
      .number('Kategori wajib dipilih')
      .int('Kategori tidak valid')
      .positive('Kategori wajib dipilih')
  ),
  stok: z.preprocess(
    toNumber,
    z
      .number('Stok harus berupa angka')
      .int('Stok harus bilangan bulat')
      .min(0, 'Stok tidak boleh negatif')
  ),
});

// Isian awal form: semua string agar cocok dengan value input/select.
export const emptyBarangForm = { nama: '', kategoriId: '', stok: '' };

// Hasil: { data } jika valid, atau { errors } berisi pesan per field.
export function validateBarangForm(formData) {
  const result = barangSchema.safeParse(formData);
  if (result.success) return { data: result.data };

  const errors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field !== undefined && errors[field] === undefined) {
      errors[field] = issue.message;
    }
  }

  return { errors };
}

