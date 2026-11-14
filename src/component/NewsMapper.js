const CATEGORY = 'CNN Indonesia';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

function formatDate(isoDate) {
    if (!isoDate) return '';

    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return '';

    return dateFormatter.format(date);
}

// Menyeragamkan item dari Berita Indo API ke bentuk yang dipakai NewsCard.
export function mapNewsItems(items) {
    if (!Array.isArray(items)) return [];

    return items.map((item) => ({
        title: item.title,
        link: item.link,
        image: item.image?.large || item.image?.small || '',
        category: CATEGORY,
        date: formatDate(item.isoDate),
    }));
}
