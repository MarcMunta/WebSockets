const express = require('express');
const fs = require('fs');
const router = express.Router();
const file = './data/messages.json';

router.get('/view', (req, res) => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
  const data = fs.readFileSync(file);
  res.json(JSON.parse(data));
});


router.get('/export', (req, res) => {
  const format = req.query.format || 'json';
  const data = fs.readFileSync(file);
  const messages = JSON.parse(data);
  if (format === 'txt') {
    const txt = messages.map(m => `[${m.user}] ${m.text}`).join('\n');
    res.setHeader('Content-Disposition', 'attachment; filename=historial.txt');
    res.send(txt);
  } else {
    res.setHeader('Content-Disposition', 'attachment; filename=historial.json');
    res.json(messages);
  }
});

module.exports = router;