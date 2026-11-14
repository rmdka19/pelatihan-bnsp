// Kartu profil anggota tim — styling Tailwind, mendukung aksi CRUD (Edit & Hapus)
// plus aksi warisan modul sebelumnya (Beri Bintang & Ubah Status)

function TeamCard({ member, onEdit, onDelete, onToggleStatus, onAddStar }) {
  const { id, namaLengkap, posisi, status, rating, avatar } = member;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 pb-5 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <img src={avatar} alt={namaLengkap} className="mb-3.5 h-20 w-20 rounded-full object-cover shadow-md" />

      <div className="w-full">
        <h3 className="mb-1 text-lg font-bold text-slate-900">{namaLengkap}</h3>
        <p className="mb-3 text-sm font-normal text-slate-500">{posisi}</p>

        {/* Badge Status & Rating Bintang */}
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${status === 'Online' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            • {status}
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold tracking-wide text-amber-700">
            ⭐ {rating} Bintang
          </span>
        </div>

        {/* Aksi Warisan: Beri Bintang & Ubah Status */}
        <div className="mt-1 flex w-full gap-2">
          <button
            onClick={() => onAddStar(id)}
            className="flex-1 cursor-pointer font-[inherit] whitespace-nowrap rounded-lg border-[1.5px] border-amber-500 bg-white py-2 text-xs font-bold text-amber-600 transition hover:border-amber-600 hover:bg-amber-100 active:scale-[0.97]"
          >
            ⭐ Beri Bintang
          </button>
          <button
            onClick={() => onToggleStatus(id)}
            className="flex-1 cursor-pointer border-0 font-[inherit] whitespace-nowrap rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 active:scale-[0.97]"
          >
            Ubah ke {status === 'Online' ? 'Offline' : 'Online'}
          </button>
        </div>

        {/* Aksi CRUD: Edit & Hapus */}
        <div className="mt-2 flex w-full gap-2">
          <button
            onClick={() => onEdit(id)}
            className="flex-1 cursor-pointer border-0 font-[inherit] whitespace-nowrap rounded-lg bg-sky-600 py-2 text-xs font-semibold text-white transition hover:bg-sky-700 active:scale-[0.97]"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onDelete(id)}
            className="flex-1 cursor-pointer border-0 font-[inherit] whitespace-nowrap rounded-lg bg-red-600 py-2 text-xs font-semibold text-white transition hover:bg-red-700 active:scale-[0.97]"
          >
            🗑️ Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamCard;
