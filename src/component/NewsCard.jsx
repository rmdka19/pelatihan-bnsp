function NewsCard({ title, image, category, date, link }) {
    const fallback = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500&q=80';

    return (
        <div className="news-card">
            <div className="news-thumb-wrapper">
                <img
                    src={image || fallback}
                    alt={title}
                    className="news-thumb"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallback;
                    }}
                />
                {category && <span className="news-category-badge">{category}</span>}
            </div>

            <div className="news-body">
                <h3 className="news-headline" title={title}>{title}</h3>
                <div className="news-meta">
                    <span className="news-date">📅 {date}</span>
                    <a href={link} target="_blank" rel="noreferrer" className="news-link">
                        Baca →
                    </a>
                </div>
            </div>
        </div>
    );
}

export default NewsCard;