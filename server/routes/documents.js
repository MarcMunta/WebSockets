const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');

const upload = multer({ dest: './public/uploads/' });

router.post('/upload', upload.single('file'), (req, res) => {
  res.json({ filename: req.file.filename });
});

router.get('/list', (req, res) => {
  fs.readdir('./public/uploads/', (err, files) => {
    if (err) return res.status(500).json({ error: 'Error al listar archivos' });
    res.json(files);
  });
});

router.get('/download/:filename', (req, res) => {
  const filepath = `./public/uploads/${req.params.filename}`;
  if (fs.existsSync(filepath)) {
    res.download(filepath);
  } else {
    res.status(404).json({ error: 'Archivo no encontrado' });
  }
});

module.exports = router;