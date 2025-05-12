const express = require('express');
const fs = require('fs');
const router = express.Router();
const dbPath = './data/database.json';

router.post('/login', (req, res) => {
  const { usernameOrEmail } = req.body;
  const data = JSON.parse(fs.readFileSync(dbPath));
  const user = data.usuarios.find(u =>
    u.nombre.toLowerCase() === usernameOrEmail.toLowerCase() ||
    u.email.toLowerCase() === usernameOrEmail.toLowerCase()
  );
  if (user) res.json({ success: true, user });
  else res.status(401).json({ error: 'Usuario no autorizado' });
});
module.exports = router;