import { useState } from 'react';
import TeamDirectory from './component/TeamDirectory';
import NewsFeed from './component/NewsFeed';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('team');

  return (
    <div className="app-layout">
      <header className="main-header">
        <h1>Portal Manajemen & Informasi Tim</h1>
        <p>Aplikasi Terpadu Pelatihan Fullstack Node.js & React</p>

        <nav className="tab-bar">
          <button
            className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            👥 Anggota Tim
          </button>
          <button
            className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            📰 Berita Terkini
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'team' ? <TeamDirectory /> : <NewsFeed />}
      </main>
    </div>
  );
}

export default App;