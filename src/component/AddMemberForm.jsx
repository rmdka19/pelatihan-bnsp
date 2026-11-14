import { useState } from 'react';
import { z } from 'zod';

// 1. Skema validasi deklaratif Zod — field sesuai spesifikasi CRUD
const memberSchema = z.object({
  namaLengkap: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  posisi: z.string().min(1, 'Wajib memilih salah satu peran tim'),
});

const EMPTY_FORM = { namaLengkap: '', email: '', posisi: '' };

function AddMemberForm({ onSubmit, editingMember, onCancelEdit }) {
  // 2. Dua arah: parent me-remount form ini (key berubah saat editId berubah),
  //    jadi initial state langsung diambil dari data anggota yang diedit —
  //    saat kembali ke mode Tambah, form ter-remount dalam keadaan kosong
  const [formData, setFormData] = useState(
    editingMember
      ? {
          namaLengkap: editingMember.namaLengkap,
          email: editingMember.email,
          posisi: editingMember.posisi,
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (errors.form) setErrors(prev => ({ ...prev, form: '' }));
  };

  // 3. Submit: cegah default, validasi, lalu serahkan ke parent
  //    (parent menentukan create vs update berdasarkan editId).
  //    Form hanya dikosongkan kalau request ke API berhasil.
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = memberSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach(issue => { fieldErrors[issue.path[0]] = issue.message; });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      await onSubmit(result.data);
      setFormData(EMPTY_FORM);
    } catch (err) {
      // Isian tetap dipertahankan supaya user bisa mencoba lagi
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `font-[inherit] rounded-lg border-[1.5px] px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-600 ${errors[field] ? 'border-red-500 bg-red-50' : 'border-slate-300'}`;

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border-[1.5px] border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-left text-lg font-bold text-slate-900">
        {editingMember ? '✏️ Edit Anggota Tim' : 'Tambah Anggota Tim'}
      </h3>

      <div className="grid items-end gap-3.5 md:grid-cols-[1fr_1fr_1fr_auto]">
        <div className="flex flex-col gap-1 text-left">
          <label className="text-[13px] font-semibold text-slate-700">Nama Lengkap</label>
          <input
            name="namaLengkap"
            placeholder="Contoh: Rina Wijaya"
            value={formData.namaLengkap}
            onChange={handleChange}
            className={inputClass('namaLengkap')}
          />
          {errors.namaLengkap && <span className="text-xs font-semibold text-red-600">⚠️ {errors.namaLengkap}</span>}
        </div>

        <div className="flex flex-col gap-1 text-left">
          <label className="text-[13px] font-semibold text-slate-700">Email Perusahaan</label>
          <input
            name="email"
            placeholder="Contoh: rina@perusahaan.com"
            value={formData.email}
            onChange={handleChange}
            className={inputClass('email')}
          />
          {errors.email && <span className="text-xs font-semibold text-red-600">⚠️ {errors.email}</span>}
        </div>

        <div className="flex flex-col gap-1 text-left">
          <label className="text-[13px] font-semibold text-slate-700">Posisi / Peran Tim</label>
          <select
            name="posisi"
            value={formData.posisi}
            onChange={handleChange}
            className={inputClass('posisi')}
          >
            <option value="">-- Pilih Posisi Tim --</option>
            <option value="Frontend Dev">Frontend Dev</option>
            <option value="Backend Engineer">Backend Engineer</option>
            <option value="UI/UX Designer">UI/UX Designer</option>
          </select>
          {errors.posisi && <span className="text-xs font-semibold text-red-600">⚠️ {errors.posisi}</span>}
        </div>

        <div className="flex gap-2">
          {editingMember && (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={submitting}
              className="cursor-pointer border-0 font-[inherit] whitespace-nowrap rounded-lg bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer border-0 font-[inherit] whitespace-nowrap rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? 'Menyimpan...'
              : editingMember
                ? 'Simpan Perubahan'
                : '+ Tambah Anggota'}
          </button>
        </div>
      </div>

      {errors.form && (
        <p role="alert" className="mt-3 text-left text-xs font-semibold text-red-600">
          ⚠️ {errors.form}
        </p>
      )}
    </form>
  );
}

export default AddMemberForm;
