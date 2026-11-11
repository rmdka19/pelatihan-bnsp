import {useState} from 'react';

function GreetingForm() {
  const [name, setName] = useState('');

    return (
        <div style={{ margin: '20px 0' }}>
            <input 
                type="text"
                placeholder="Masukkan nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-teks"
            />
            <p>Halo, {name || 'Tamu'}</p>
        </div>
    );
}

export default GreetingForm;