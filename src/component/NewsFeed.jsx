import { useState, useEffect } from 'react';
import NewsCard from './NewsCard';

function NewsFeed() {
    // 1. Tiga Pilar State Pengendali UI
    const [news, setNews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Fungsi Asinkron Pemanggil REST API
    const fetchNews = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('https://api.siputzx.my.id/api/berita/kompas');
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            const json = await res.json();
            setNews(json.data || []);
        } catch (err) {
            setError(err.message || 'Gagal mengambil berita terkini.');
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Lifecycle Hook: Eksekusi 1x saat Mounting
    useEffect(() => {
        fetchNews();
    }, []);

    return (
        <div className="news-container">
            <div className="news-toolbar">
                <div>
                    <h2>Berita Terkini Kompas</h2>
                    <p>Menampilkan {news.length} artikel dari API Siputzx</p>
                </div>
                <button className="btn-refresh" onClick={fetchNews} disabled={isLoading}>
                    {isLoading ? '⌛ Memuat...' : '🔄 Segarkan Berita'}
                </button>
            </div>

            {isLoading && (
                <div className="spinner-box">
                    <div className="css-spinner"></div>
                    <p>Mengunduh berita nasional terbaru...</p>
                </div>
            )}

            {error && !isLoading && (
                <div className="error-banner">
                    <h5>Terjadi Kesalahan Jaringan</h5>
                    <p>{error}</p>
                    <button onClick={fetchNews}>Coba Lagi</button>
                </div>
            )}

            {!isLoading && !error && (
                <div className="news-grid">
                    {news.map((item, i) => (
                        <NewsCard key={i} {...item} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default NewsFeed;