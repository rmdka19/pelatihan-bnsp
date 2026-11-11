import { useState } from 'react';
import TeamCard from './TeamCard';
import AddMemberForm from './AddMemberForm';

function TeamDirectory() {
  const [members, setMembers] = useState([
    { id: 1, name: 'Budi Santoso', role: 'Frontend Dev', status: 'Online', stars: 2, avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'Siti Rahma', role: 'UI/UX Designer', status: 'Offline', stars: 5, avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'Ahmad Fauzi', role: 'Backend Engineer', status: 'Online', stars: 1, avatar: 'https://i.pravatar.cc/150?u=3' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Kalkulasi Statistik Reaktif (Warisan Modul 1.3 & 1.4)
  const totalMembers = members.length;
  const onlineMembers = members.filter(m => m.status === 'Online').length;
  const offlineMembers = totalMembers - onlineMembers;

  // 2. Handler Dua Arah (Lifting State Up Modul 1.4)
  const handleToggleStatus = (id) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'Online' ? 'Offline' : 'Online' } : m));
  };
  const handleAddStar = (id) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, stars: m.stars + 1 } : m));
  };

  // 3. Handler Tambah Anggota Baru (Modul 1.5)
  const handleAddMember = (newMemberData) => {
    const newEntry = { ...newMemberData, id: Date.now(), status: 'Online', stars: 0, avatar: `https://i.pravatar.cc/150?u=${Date.now()}` };
    setMembers(prev => [newEntry, ...prev]);
  };

  // 4. Filter Live Search
  const filteredMembers = members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="directory-container">
      <div className="stats-bar">
        <div className="stat-box"><div className="stat-num">{totalMembers}</div><div className="stat-label">Total Members</div></div>
        <div className="stat-box"><div className="stat-num online">{onlineMembers}</div><div className="stat-label">Online</div></div>
        <div className="stat-box"><div className="stat-num offline">{offlineMembers}</div><div className="stat-label">Offline</div></div>
      </div>
      <AddMemberForm onAddMember={handleAddMember} />
      <input type="text" placeholder="Cari nama anggota tim..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
      <div className="team-grid">
        {filteredMembers.length === 0 ? (
          <div className="empty-state">⚠️ Tidak ada anggota tim yang cocok dengan kata kunci "{searchTerm}".</div>
        ) : (
          filteredMembers.map(member => (
            <TeamCard key={member.id} {...member} onToggleStatus={handleToggleStatus} onAddStar={handleAddStar} />
          ))
        )}
      </div>
    </div>
  );
}

export default TeamDirectory;