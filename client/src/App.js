import React, { useState } from 'react';
import Login from './Login';
import ChatRoom from './ChatRoom';
import FileUploader from './FileUploader';

function App() {
  const [user, setUser] = useState(null);
  if (!user) return <Login onLogin={setUser} />;
  return (
    <div id="root">
      <div className="app-container">
        <div className="chat-container">
          <h2>Chat en tiempo real</h2>
          <ChatRoom user={user} />
        </div>
        <div className="document-container">
          <h2>Gestión de Documentos</h2>
          <FileUploader />
        </div>
      </div>
    </div>
  );
}

export default App;