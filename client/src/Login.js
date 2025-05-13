import React, { useState } from 'react';
import axios from 'axios';
import './css/App.css';

function Login({ onLogin }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/auth/login', { usernameOrEmail: input });
      onLogin(res.data.user.nombre);
    } catch (err) {
      setError('Usuari no autoritzat');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-box">
        <h2>Inici de Sessió</h2>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Nom o correu electrònic"
          className="login-input"
        />
        <button type="submit" className="login-button">Entrar</button>
        {error && <div className="login-error">{error}</div>}
      </form>
    </div>
  );
}

export default Login;
