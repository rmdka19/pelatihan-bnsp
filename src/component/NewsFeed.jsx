import { useState, useEffect } from 'react';
import NewsCard from './NewsCard';
import { mapNewsItems } from './newsMapper';

const NEWS_URL = 'https://berita-indo-api.vercel.app/v1/cnn-news';

async function fetchNewsItems(signal) {
    const res = await fetch(NEWS_URL, { signal });
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const json = await res.json();
    return mapNewsItems(json.data);
}

function NewsFeed() {
    // 1. Tiga Pilar State Pengendali UI
    const [news, setNews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Lifecycle Hook: Eksekusi 1x saat Mounting
    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            try {
                const items = await fetchNewsItems(controller.signal);
                setNews(items);
            } catch (err) {
                if (err.name === 'AbortError') return;
                setError(err.message || 'Gagal mengambil berita terkini.');
            } finally {
                setIsLoading(false);
            }
        })();

        return () => controller.abort();
    }, []);

    // 3. Refresh manual: state loading diubah dari event handler
    const handleRefresh = async () => {
        setIsLoading(true);
        setError(null);
        try {
            setNews(await fetchNewsItems());
        } catch (err) {
            setError(err.message || 'Gagal mengambil berita terkini.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="news-container">
            <div className="news-toolbar">
                <div>
                    <h2>Berita Terkini CNN Indonesia</h2>
                    <p>Menampilkan {news.length} artikel dari Berita Indo API</p>
                </div>
                <button className="btn-refresh" onClick={handleRefresh} disabled={isLoading}>
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
                    <button onClick={handleRefresh}>Coba Lagi</button>
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
