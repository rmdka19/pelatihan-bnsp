import { useState } from 'react';
import { z } from 'zod';

// 1. Skema validasi data anggota tim deklaratif Zod
const memberSchema = z.object({
  name: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  role: z.string().min(1, 'Wajib memilih salah satu peran tim')
});

function AddMemberForm({ onAddMember }) {
  const [formData, setFormData] = useState({ name: '', email: '', role: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = memberSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach(issue => { fieldErrors[issue.path[0]] = issue.message; });
      setErrors(fieldErrors);
      return;
    }
    onAddMember(result.data);
    setFormData({ name: '', email: '', role: '' });
    setErrors({});
  };

  return (
    <form className="add-member-form" onSubmit={handleSubmit}>
      <h3 className="form-title">Tambah Anggota Tim</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Nama Lengkap</label>
          <input name="name" placeholder="Contoh: Rina Wijaya" value={formData.name} onChange={handleChange} className={errors.name ? 'input-error' : ''} />
          {errors.name && <span className="error-text">⚠️ {errors.name}</span>}
        </div>
        <div className="form-group">
          <label>Email Perusahaan</label>
          <input name="email" placeholder="Contoh: rina@perusahaan.com" value={formData.email} onChange={handleChange} className={errors.email ? 'input-error' : ''} />
          {errors.email && <span className="error-text">⚠️ {errors.email}</span>}
        </div>
        <div className="form-group">
          <label>Posisi / Peran Tim</label>
          <select name="role" value={formData.role} onChange={handleChange} className={errors.role ? 'input-error' : ''}>
            <option value="">-- Pilih Posisi Tim --</option>
            <option value="Frontend Dev">Frontend Dev</option>
            <option value="Backend Engineer">Backend Engineer</option>
            <option value="UI/UX Designer">UI/UX Designer</option>
          </select>
          {errors.role && <span className="error-text">⚠️ {errors.role}</span>}
        </div>
        <button type="submit" className="btn-submit">+ Tambah Anggota</button>
      </div>
    </form>
  );
}

export default AddMemberForm;