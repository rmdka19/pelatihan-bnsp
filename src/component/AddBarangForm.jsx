import { useState } from 'react';
import { emptyBarangForm, validateBarangForm } from './barangForm.js';

function AddBarangForm({ onSubmit, editingBarang, onCancelEdit, kategoriList }) {
  // Parent me-remount form ini saat editId berubah (key), jadi isian edit
  // langsung terisi dan kembali kosong saat batal / selesai menyimpan.
  const [formData, setFormData] = useState(
    editingBarang
      ? {
          nama: editingBarang.nama,
          kategoriId: String(editingBarang.kategoriId),
          stok: String(editingBarang.stok),
        }
      : emptyBarangForm
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (errors.form) setErrors(prev => ({ ...prev, form: '' }));
  };

  // Submit: cegah reload halaman, validasi nama/kategori/stok,
  // lalu serahkan payload angka ke parent (create atau update).
  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = validateBarangForm(formData);
    if (result.errors) {
      setErrors(result.errors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      await onSubmit(result.data);
      setFormData(emptyBarangForm);
    } catch (err) {
      // Isian dipertahankan supaya user bisa memperbaiki lalu mencoba lagi.
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `font-[inherit] rounded-lg border-[1.5px] px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-600 ${errors[field] ? 'border-red-500 bg-red-50' : 'border-slate-300'}`;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mb-6 rounded-2xl border-[1.5px] border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="mb-4 text-left text-lg font-bold text-slate-900">
        {editingBarang ? '✏️ Edit Barang' : 'Tambah Barang'}
      </h3>

      <div className="grid items-end gap-3.5 md:grid-cols-[1.4fr_1fr_0.7fr_auto]">
        <div className="flex flex-col gap-1 text-left">
          <label htmlFor="barang-nama" className="text-[13px] font-semibold text-slate-700">
            Nama Barang
          </label>
          <input
            id="barang-nama"
            name="nama"
            placeholder="Contoh: Laptop Belajar"
            value={formData.nama}
            onChange={handleChange}
            className={inputClass('nama')}
          />
          {errors.nama && (
            <span className="text-xs font-semibold text-red-600">⚠️ {errors.nama}</span>
          )}
        </div>

        <div className="flex flex-col gap-1 text-left">
          <label htmlFor="barang-kategori" className="text-[13px] font-semibold text-slate-700">
            Kategori
          </label>
          <select
            id="barang-kategori"
            name="kategoriId"
            value={formData.kategoriId}
            onChange={handleChange}
            className={inputClass('kategoriId')}
          >
            <option value="">-- Pilih Kategori --</option>
            {kategoriList.map((kategori) => (
              <option key={kategori.id} value={String(kategori.id)}>
                {kategori.nama}
              </option>
            ))}
          </select>
          {errors.kategoriId && (
            <span className="text-xs font-semibold text-red-600">⚠️ {errors.kategoriId}</span>
          )}
        </div>

        <div className="flex flex-col gap-1 text-left">
          <label htmlFor="barang-stok" className="text-[13px] font-semibold text-slate-700">
            Jumlah / Stok
          </label>
          <input
            id="barang-stok"
            name="stok"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            placeholder="0"
            value={formData.stok}
            onChange={handleChange}
            className={inputClass('stok')}
          />
          {errors.stok && (
            <span className="text-xs font-semibold text-red-600">⚠️ {errors.stok}</span>
          )}
        </div>

        <div className="flex gap-2">
          {editingBarang && (
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
              : editingBarang
                ? 'Simpan Perubahan'
                : '+ Tambah Barang'}
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

export default AddBarangForm;

