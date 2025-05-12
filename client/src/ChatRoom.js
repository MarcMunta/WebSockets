import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
const socket = io('http://localhost:3001');

function ChatRoom({ user }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{ user: 'Sistema', text: 'Benvingut al xat!' }]);

  useEffect(() => {
    socket.on('receive_message', data => {
      setMessages(prev => [...prev, data]);
    });
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send_message', { user, text: message });
      setMessage('');
    }
  };

  return (<div>
    <h2>Xat en temps real</h2>
    <div style={{ maxHeight: '150px', overflowY: 'auto', background: '#555', padding: '1rem', marginBottom: '1rem' }}>
      {messages.map((msg, i) => <div key={i}><b>{msg.user}:</b> {msg.text}</div>)}
    </div>
    <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Escriu un missatge" />
    <button onClick={sendMessage}>Enviar</button>
  </div>);
}
export default ChatRoom;