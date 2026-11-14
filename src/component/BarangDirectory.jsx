import { useEffect, useState } from 'react';
import AddBarangForm from './AddBarangForm';
import {
  createBarang,
  deleteBarang,
  listBarang,
  listKategori,
  updateBarang,
} from '../api/barang';

function BarangDirectory() {
  const [barang, setBarang] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null); // { type: 'success' | 'error', message }

  // 1. Ambil data barang dan kategori sekali saat komponen tampil.
  //    Semua update state terjadi di callback async.
  useEffect(() => {
    let cancelled = false;

    Promise.all([listBarang(), listKategori()])
      .then(([barangData, kategoriData]) => {
        if (cancelled) return;
        setBarang(barangData);
        setKategoriList(kategoriData);
        setError('');
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Notifikasi sukses/gagal hilang otomatis setelah 4 detik.
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const showNotice = (type, message) => setNotice({ type, message });

  // Ganti satu barang di state dengan versi terbaru dari server.
  const replaceBarang = (updated) => {
    setBarang(prev => prev.map(item => (item.id === updated.id ? updated : item)));
  };

  // 2. Create & Update (dipanggil oleh form submit).
  //    Error dilempar kembali ke form supaya isian tidak hilang.
  const handleSubmit = async (payload) => {
    try {
      if (editId !== null) {
        const updated = await updateBarang(editId, payload);
        replaceBarang(updated);
        setEditId(null);
        showNotice('success', `Barang "${updated.nama}" berhasil diperbarui.`);
      } else {
        const created = await createBarang(payload);
        setBarang(prev => [...prev, created]);
        showNotice('success', `Barang "${created.nama}" berhasil ditambahkan.`);
      }
      setError('');
    } catch (err) {
      showNotice('error', `Gagal menyimpan: ${err.message}`);
      throw err;
    }
  };

  // 3. Delete dengan dialog konfirmasi.
  const handleDelete = async (item) => {
    if (!window.confirm(`Yakin ingin menghapus barang "${item.nama}"?`)) return;

    try {
      await deleteBarang(item.id);
      setBarang(prev => prev.filter(row => row.id !== item.id));
      if (editId === item.id) setEditId(null);
      showNotice('success', `Barang "${item.nama}" berhasil dihapus.`);
    } catch (err) {
      showNotice('error', `Gagal menghapus: ${err.message}`);
    }
  };

  const editingBarang =
    editId !== null ? barang.find(item => item.id === editId) || null : null;

  const totalStok = barang.reduce((sum, item) => sum + item.stok, 0);

  return (
    <div className="w-full">
      {/* Notifikasi aksi */}
      {notice && (
        <div
          role={notice.type === 'error' ? 'alert' : 'status'}
          className={`fixed right-5 top-5 z-50 flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold shadow-lg ${
            notice.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <span aria-hidden="true">{notice.type === 'success' ? '✅' : '⚠️'}</span>
          <span className="flex-1">{notice.message}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Tutup notifikasi"
            className="cursor-pointer border-0 bg-transparent text-lg leading-none text-slate-500 hover:text-slate-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Statistik ringkas */}
      <div className="mb-6 flex flex-wrap justify-center gap-4">
        <div className="min-w-[120px] rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-center shadow-sm">
          <div className="text-2xl font-bold leading-tight text-sky-600">{barang.length}</div>
          <div className="mt-1 text-[13px] font-medium text-slate-500">Jenis Barang</div>
        </div>
        <div className="min-w-[120px] rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-center shadow-sm">
          <div className="text-2xl font-bold leading-tight text-green-600">{totalStok}</div>
          <div className="mt-1 text-[13px] font-medium text-slate-500">Total Stok</div>
        </div>
        <div className="min-w-[120px] rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-center shadow-sm">
          <div className="text-2xl font-bold leading-tight text-slate-600">{kategoriList.length}</div>
          <div className="mt-1 text-[13px] font-medium text-slate-500">Kategori</div>
        </div>
      </div>

      {/* Pesan error saat memuat data dari server */}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-medium text-red-700"
        >
          ⚠️ {error}
          {!loading && barang.length === 0 && (
            <span className="mt-1 block font-normal text-red-600">
              Pastikan server API berjalan: jalankan{' '}
              <code className="font-semibold">npm run server</code>.
            </span>
          )}
        </div>
      )}

      {/* Form Tambah / Edit — key berubah saat editId berubah */}
      <AddBarangForm
        key={editId ?? 'new'}
        onSubmit={handleSubmit}
        editingBarang={editingBarang}
        onCancelEdit={() => setEditId(null)}
        kategoriList={kategoriList}
      />

      {/* Tabel barang */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-[13px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Nama Barang</th>
              <th className="px-4 py-3 font-semibold">Kategori</th>
              <th className="px-4 py-3 text-right font-semibold">Stok</th>
              <th className="px-4 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                  Memuat data barang...
                </td>
              </tr>
            ) : barang.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                  {error
                    ? 'Data barang tidak dapat dimuat. Periksa pesan error di atas.'
                    : 'Belum ada barang. Tambahkan barang pertama lewat form di atas.'}
                </td>
              </tr>
            ) : (
              barang.map(item => (
                <tr
                  key={item.id}
                  className={`border-t border-slate-100 ${
                    editId === item.id ? 'bg-sky-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-4 py-3 font-semibold text-slate-800">{item.nama}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-bold ${
                        item.stok === 0 ? 'text-red-600' : 'text-slate-800'
                      }`}
                    >
                      {item.stok}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditId(item.id)}
                        className="cursor-pointer rounded-lg border-[1.5px] border-amber-400 bg-white px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="cursor-pointer rounded-lg border-[1.5px] border-red-400 bg-white px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BarangDirectory;

