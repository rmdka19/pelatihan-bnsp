import {useState} from 'react';

function Counter() {
  const [hitung, setHitung] = useState(0);

  return (
    <div style={{ margin: '20px 0' }}>
        <h1>Komponen Hitungan: {hitung}</h1>       
        <button onClick={() => setHitung(hitung + 1)}>
            Tambah Angka
    </button>
    </div>
  );
}

export default Counter;