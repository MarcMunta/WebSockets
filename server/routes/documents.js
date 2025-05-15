const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const router = express.Router();

const uploadDir = "./public/uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_${timestamp}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "text/plain"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Tipus de fitxer no permès. Només .txt i .pdf"));
  },
});

// Subir archivo
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No s'ha rebut cap fitxer." });
  }
  // El evento "new_file_uploaded" debe emitirse desde server.js al recibir este POST
  res.json({ filename: req.file.filename });
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
      res.status(500).json({ error: "Error al intentar descargar el archivo." });
    }
  });
});

// Leer contenido
router.get("/read/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../public/uploads", req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Fitxer no trobat" });
  }
  const content = fs.readFileSync(filePath, "utf-8");
  res.json({ content });
});

// Guardar cambios en archivo
router.post("/save/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../public/uploads", req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Fitxer no trobat" });
  }
  fs.writeFileSync(filePath, req.body.content);
  res.json({ message: "Fitxer desat correctament" });
});

module.exports = router;