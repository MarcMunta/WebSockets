import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FileEditor() {
  const [files, setFiles] = useState([]);
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/documents/list').then(res => setFiles(res.data));
  }, []);

  const handleOpen = async (filename) => {
    const res = await axios.get(`http://localhost:3001/documents/read/${filename}`);
    setContent(res.data.content);
    setSelectedFile(filename);
  };

  const handleSave = async () => {
    await axios.post(`http://localhost:3001/documents/save/${selectedFile}`, { content });
    alert('Fitxer desat correctament!');
  };

  return (
    <div>
      <h3>Llista de fitxers</h3>
      <ul>
        {files.map((f, i) => (
          <li key={i}>
            {f}
            <button onClick={() => handleOpen(f)}>Obrir</button>
          </li>
        ))}
      </ul>

      {selectedFile && (
        <>
          <h4>Editant: {selectedFile}</h4>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={10} cols={60} />
          <br />
          <button onClick={handleSave}>Guardar canvis</button>
        </>
      )}
    </div>
  );
}

export default FileEditor;
