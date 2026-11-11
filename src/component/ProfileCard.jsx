import { useState } from 'react';
import '../App.css';

function ProfileCard() {
  // State untuk menyimpan data input profesi / pekerjaan
  const [profesi, setProfesi] = useState('');

  // State untuk menyimpan jumlah likes
  const [likes, setLikes] = useState(0);

  // Handler untuk menambah jumlah likes saat tombol diklik
  const handleLike = () => {
    setLikes(likes + 1);
  };

  return (
    <div className="profile-card">
      {/* Avatar / Ikon Profil */}
      <div className="profile-avatar">
        👤
      </div>

      <h2 className="profile-title">Kartu Profil</h2>

      {/* Form Input Pekerjaan */}
      <div className="input-group">
        <label htmlFor="profesiInput" className="input-label">
          Input Pekerjaan
        </label>
        <input
          id="profesiInput"
          type="text"
          value={profesi}
          onChange={(e) => setProfesi(e.target.value)}
          placeholder="Contoh: Web Developer..."
          className="profile-input"
        />
      </div>

      {/* Hasil Input Pekerjaan */}
      <div className="result-box">
        <span className="result-label">Pekerjaan:</span>
        <span className="result-value">
          {profesi.trim() ? profesi : <em>Belum diisi</em>}
        </span>
      </div>

      {/* Tombol Suka di bawah hasil input pekerjaan */}
      <button onClick={handleLike} className="like-button">
        <span className="heart-icon">❤️</span> Suka ({likes})
      </button>
    </div>
  );
}

export default ProfileCard;
