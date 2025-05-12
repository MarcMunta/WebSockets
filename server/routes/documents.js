const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Crear carpeta si no existe
const uploadDir = "./public/uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Guardar con nombre original + timestamp para evitar sobrescribir
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_${timestamp}${ext}`);
  },
});

// Multer config
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "text/plain"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Tipus de fitxer no permès. Només .txt i .pdf"));
  },
});

// Subir archivo
router.post("/upload", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ filename: req.file.filename });
  });
});

// Listar archivos
router.get("/list", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Error al listar archivos" });
    res.json(files);
  });
});

// Descargar archivo
router.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../public/uploads", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Archivo no encontrado" });
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("Error al descargar:", err);
      res
        .status(500)
        .json({ error: "Error al intentar descargar el archivo." });
    }
  });
});

router.get("/read/:filename", (req, res) => {
  const filePath = path.join(
    __dirname,
    "../public/uploads",
    req.params.filename
  );
  if (!fs.existsSync(filePath))
    return res.status(404).json({ error: "Fitxer no trobat" });
  const content = fs.readFileSync(filePath, "utf-8");
  res.json({ content });
});

router.post('/save/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../public/uploads', req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Fitxer no trobat' });
  fs.writeFileSync(filePath, req.body.content);
  res.json({ message: 'Fitxer desat correctament' });
});

module.exports = router;
