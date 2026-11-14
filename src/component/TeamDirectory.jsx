import { useEffect, useState } from 'react';
import AddMemberForm from './AddMemberForm';
import TeamCard from './TeamCard';
import {
  createMember,
  deleteMember,
  listMembers,
  updateMember,
} from '../api/members';

function TeamDirectory() {
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Ambil data dari REST API sekali saat komponen tampil.
  //    Semua update state terjadi di callback async (bukan langsung di body effect).
  useEffect(() => {
    let cancelled = false;

    listMembers()
      .then((data) => {
        if (cancelled) return;
        setMembers(data);
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

  // 2. Statistik Reaktif (Total / Online / Offline)
  const totalMembers = members.length;
  const onlineMembers = members.filter(m => m.status === 'Online').length;
  const offlineMembers = members.filter(m => m.status === 'Offline').length;

  // 3. Filter Live Search berdasarkan nama lengkap
  const filteredMembers = members.filter(m =>
    m.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ganti satu anggota di state dengan versi terbaru dari server
  const replaceMember = (updated) => {
    setMembers(prev => prev.map(m => (m.id === updated.id ? updated : m)));
  };

  // 4. Handler Warisan (Modul 1.3 & 1.4): toggle status & beri bintang — disimpan ke DB
  const handleToggleStatus = async (id) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    try {
      const updated = await updateMember(id, {
        status: member.status === 'Online' ? 'Offline' : 'Online',
      });
      replaceMember(updated);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddStar = async (id) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    try {
      const updated = await updateMember(id, { rating: member.rating + 1 });
      replaceMember(updated);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // 5. CRUD — Create & Update (dipanggil oleh form submit)
  //    Error sengaja dilempar ke form supaya isian user tidak hilang saat request gagal.
  const handleSubmit = async (formData) => {
    if (editId !== null) {
      // Mode Update: simpan perubahan, lalu kembali ke mode Tambah
      const updated = await updateMember(editId, formData);
      replaceMember(updated);
      setEditId(null);
    } else {
      // Mode Create: server yang menentukan id, status Online, rating 0, dan avatar
      const created = await createMember(formData);
      setMembers(prev => [...prev, created]);
    }
    setError('');
  };

  // 6. CRUD — Delete (dengan konfirmasi window.confirm)
  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus anggota tim ini?')) return;
    try {
      await deleteMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));
      // Batalkan mode edit jika anggota yang dihapus sedang diedit
      if (editId === id) setEditId(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // 7. CRUD — masuk mode Edit (form di atas akan terisi data anggota ini)
  const handleEdit = (id) => setEditId(id);

  const editingMember = editId !== null
    ? (members.find(m => m.id === editId) || null)
    : null;

  return (
    <div className="w-full">
      {/* Kartu Statistik Dinamis */}
      <div className="mb-6 flex flex-wrap justify-center gap-4">
        <div className="min-w-[120px] rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-center shadow-sm">
          <div className="text-2xl font-bold leading-tight text-sky-600">{totalMembers}</div>
          <div className="mt-1 text-[13px] font-medium text-slate-500">Total Members</div>
        </div>
        <div className="min-w-[120px] rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-center shadow-sm">
          <div className="text-2xl font-bold leading-tight text-green-600">{onlineMembers}</div>
          <div className="mt-1 text-[13px] font-medium text-slate-500">Online</div>
        </div>
        <div className="min-w-[120px] rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-center shadow-sm">
          <div className="text-2xl font-bold leading-tight text-slate-500">{offlineMembers}</div>
          <div className="mt-1 text-[13px] font-medium text-slate-500">Offline</div>
        </div>
      </div>

      {/* Pesan error dari server (hapus / status / bintang / muat data) */}
      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-medium text-red-700">
          ⚠️ {error}
          {!loading && members.length === 0 && (
            <span className="mt-1 block font-normal text-red-600">
              Pastikan server API berjalan: jalankan <code className="font-semibold">npm run server</code>.
            </span>
          )}
        </div>
      )}

      {/* Form Tambah / Edit Anggota — key berubah saat editId berubah,
          sehingga form ter-remount dan terisi data anggota yang diedit */}
      <AddMemberForm
        key={editId ?? 'new'}
        onSubmit={handleSubmit}
        editingMember={editingMember}
        onCancelEdit={() => setEditId(null)}
      />

      {/* Live Search */}
      <input
        type="text"
        placeholder="Cari nama anggota tim..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mx-auto mb-8 block w-full max-w-md rounded-xl border-[1.5px] border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-[3px] focus:ring-sky-600/15"
      />

      {/* Grid Kartu Anggota */}
      <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-[15px] text-slate-500">
            Memuat data anggota tim...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-[15px] text-slate-500">
            {members.length === 0
              ? 'Belum ada anggota tim. Tambahkan anggota pertama lewat form di atas.'
              : `⚠️ Tidak ada anggota tim yang cocok dengan kata kunci "${searchQuery}".`}
          </div>
        ) : (
          filteredMembers.map(member => (
            <TeamCard
              key={member.id}
              member={member}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onAddStar={handleAddStar}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TeamDirectory;
