import React, { useState } from 'react';
import axios from 'axios';

function FileUploader() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert('Selecciona un fitxer primer!');
    const formData = new FormData();
    formData.append('file', file);
    await axios.post('http://localhost:3001/documents/upload', formData);
    alert('Fitxer pujat!');
  };

  return (<div>
    <h2>Pujar Fitxer</h2>
    <input type="file" onChange={e => setFile(e.target.files[0])} />
    <button onClick={handleUpload}>Pujar</button>
  </div>);
}
export default FileUploader;