import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/auth/login', { usernameOrEmail: input });
      onLogin(res.data.user.nombre);
    } catch (err) {
      setError('Usuario no autorizado');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Nom o email"
      />
      <button type="submit">Entrar</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}

export default Login;