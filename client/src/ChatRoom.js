import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './css/ChatRoom.css';

const socket = io('http://localhost:3001');

function ChatRoom({ user }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{ user: 'Sistema', text: 'Benvingut al xat!' }]);

  useEffect(() => {
    socket.on('receive_message', data => {
      setMessages(prev => [...prev, data]);
    });

    // Limpieza al desmontar el componente
    return () => {
      socket.off('receive_message');
    };
  }, []);

  const sendMessage = e => {
    // Evitar que el formulario recargue la página si se usa Enter
    if (e) e.preventDefault();

    if (message.trim()) {
      socket.emit('send_message', { user, text: message });
      setMessage('');
    }
  };

  const handleKeyPress = e => {
    // Enviar mensaje solo si se presiona Enter (sin Shift u otras teclas)
    if (e.key === 'Enter' && !e.shiftKey) {
      sendMessage(e);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.user === user ? 'message-sent' : 'message-received'}`}>
            <b>{msg.user}:</b>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escriu un missatge..."
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
}

export default ChatRoom;