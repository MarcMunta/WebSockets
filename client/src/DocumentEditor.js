import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
const socket = io('http://localhost:3001');

function DocumentEditor() {
  const [content, setContent] = useState('Document col·laboratiu iniciat...');

  useEffect(() => {
    socket.on('document_update', data => {
      setContent(data);
    });
  }, []);

  const handleChange = e => {
    const text = e.target.value;
    setContent(text);
    socket.emit('edit_document', text);
  };

  return (<div>
    <h2>Editor Col·laboratiu</h2>
    <textarea value={content} onChange={handleChange} rows={10} cols={50} />
  </div>);
}
export default DocumentEditor;