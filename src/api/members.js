// Klien REST API untuk data anggota tim.
// Di dev, Vite mem-proxy /api ke http://localhost:3000 (lihat vite.config.js).

const ENDPOINT = '/api/members';

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

export function listMembers() {
  return request(ENDPOINT);
}

export function createMember(formData) {
  return request(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

export function updateMember(id, changes) {
  return request(`${ENDPOINT}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });
}

export function deleteMember(id) {
  return request(`${ENDPOINT}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

