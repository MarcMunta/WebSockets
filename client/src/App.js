import React, { useState } from 'react';
import Login from './Login';
import ChatRoom from './ChatRoom';
import FileUploader from './FileUploader';
import DocumentEditor from './DocumentEditor';

function App() {
  const [user, setUser] = useState(null);
  if (!user) return <Login onLogin={setUser} />;
  return (<div><h1>Benvingut, {user}</h1><ChatRoom user={user} /><FileUploader /></div>);
}
export default App;