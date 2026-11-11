// src/components/TeamCard.jsx (Kode Utuh Modul 1.4)
// Komponen anak modular yang reusable dengan komunikasi dua arah (Lifting State Up)

function TeamCard({ id, name, role, avatar, status, stars, onToggleStatus, onAddStar }) {
  return (
    <div className="team-card">
      <img src={avatar} alt={name} className="card-avatar" />

      <div className="card-info">
        <h3 className="card-name">{name}</h3>
        <p className="card-role">{role}</p>

        {/* Badge Status & Bintang */}
        <div className="badges-group">
          <span className={`badge ${status === 'Online' ? 'badge-online' : 'badge-offline'}`}>
            • {status}
          </span>
          <span className="badge badge-star">
            ⭐ {stars} Bintang
          </span>
        </div>

        {/* Tombol Aksi: Beri Bintang & Ubah Status */}
        <div className="card-actions">
          <button
            className="btn-star"
            onClick={() => onAddStar(id)}
          >
            ⭐ Beri Bintang
          </button>

          <button
            className="btn-status-toggle"
            onClick={() => onToggleStatus(id)}
          >
            Ubah ke {status === 'Online' ? 'Offline' : 'Online'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamCard;
