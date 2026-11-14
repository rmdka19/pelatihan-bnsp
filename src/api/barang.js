// Klien REST API untuk data barang dan kategori.
// Di dev, Vite mem-proxy /api ke http://localhost:3000 (lihat vite.config.js).

const BARANG_ENDPOINT = '/api/barang';
const KATEGORI_ENDPOINT = '/api/kategori';

async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  // DELETE sukses tidak mengirim body
  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // Server mengirim { message, errors? } — tampilkan pesan yang paling spesifik
    const fieldError = data?.errors ? Object.values(data.errors)[0] : null;
    throw new Error(fieldError || data?.message || `Permintaan gagal (HTTP ${res.status})`);
  }

  return data;
}

export function listKategori() {
  return request(KATEGORI_ENDPOINT);
}

export function listBarang() {
  return request(BARANG_ENDPOINT);
}

export function createBarang(formData) {
  return request(BARANG_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

// PUT dan PATCH sama-sama menerima body sebagian; form edit memakai PUT.
export function updateBarang(id, changes) {
  return request(`${BARANG_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });
}

export function deleteBarang(id) {
  return request(`${BARANG_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

