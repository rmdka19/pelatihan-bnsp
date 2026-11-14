import test from 'node:test';
import assert from 'node:assert/strict';
import { mapNewsItems } from './newsMapper.js';

const cnnItem = {
    title: 'Contoh berita',
    link: 'https://www.cnnindonesia.com/contoh',
    isoDate: '2026-11-12T12:00:00.000Z',
    image: {
        small: 'https://img.example.com/small.jpg',
        large: 'https://img.example.com/large.jpg',
    },
};

test('memetakan item CNN ke bentuk yang dipakai NewsCard', () => {
    const [item] = mapNewsItems([cnnItem]);

    assert.deepEqual(item, {
        title: 'Contoh berita',
        link: 'https://www.cnnindonesia.com/contoh',
        image: 'https://img.example.com/large.jpg',
        category: 'CNN Indonesia',
        date: '12 November 2026',
    });
});

test('memakai gambar small jika gambar large tidak tersedia', () => {
    const [item] = mapNewsItems([
        { ...cnnItem, image: { small: 'https://img.example.com/small.jpg' } },
    ]);

    assert.equal(item.image, 'https://img.example.com/small.jpg');
});

test('memberi gambar kosong jika item tidak punya gambar', () => {
    const [item] = mapNewsItems([{ ...cnnItem, image: undefined }]);

    assert.equal(item.image, '');
});

test('memberi tanggal kosong jika isoDate tidak ada', () => {
    const [item] = mapNewsItems([{ ...cnnItem, isoDate: undefined }]);

    assert.equal(item.date, '');
});

test('mengembalikan array kosong untuk input yang bukan array', () => {
    assert.deepEqual(mapNewsItems(null), []);
    assert.deepEqual(mapNewsItems(undefined), []);
});

