const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const documentRoutes = require("./routes/documents");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);
app.use("/documents", documentRoutes);
app.use("/documents/files", express.static(__dirname + "/public/uploads"));

const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

const filePath = path.join(__dirname, "data", "messages.json");

let messages = [];

if (fs.existsSync(filePath)) {
  try {
    messages = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    console.error("Error leyendo historial existente:", e);
    messages = [];
  }
}

let currentDocument = "";
const docPath = "./data/shared_document.txt";

if (fs.existsSync(docPath)) {
  currentDocument = fs.readFileSync(docPath, "utf-8");
}

io.on("connection", (socket) => {
  console.log("Usuari connectat");

  socket.emit("init_document", currentDocument);
  socket.emit("init_chat_history", messages);

  socket.on("request_chat_history", () => {
    socket.emit("init_chat_history", messages);
  });

  socket.on("send_message", (data) => {
    messages.push(data);
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
    io.emit("receive_message", data);
  });

  socket.on("edit_document", (data) => {
    currentDocument = data;
    io.emit("document_update", data);
  });
});

setInterval(() => {
  fs.writeFileSync(docPath, currentDocument);
}, 10000);

// SAVE_HIST
app.post("/messages/save", (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Historial no vàlid." });
  }

  try {
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
    res.json({ message: "Historial desat correctament." });
  } catch (err) {
    console.error("Error al guardar historial:", err);
    res.status(500).json({ error: "Error al guardar l’historial." });
  }
});

// EXPORT_DOC - JSON
app.get("/messages/export/json", (req, res) => {
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "No hi ha historial de missatges." });
  }
  res.download(filePath, "chat_history.json");
});

// EXPORT_DOC - TXT
app.get("/messages/export/txt", (req, res) => {
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Historial no disponible.");
  }
  const messages = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const text = messages.map((m) => `[${m.user}] ${m.text}`).join("\n");
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Content-Disposition", "attachment; filename=chat_history.txt");
  res.send(text);
});

// Upload endpoint + socket emit
app.post("/documents/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No s'ha rebut cap fitxer." });
  }

  io.emit("new_file_uploaded", req.file.originalname); 
  res.json({ message: "Fitxer pujat correctament." });
});

server.listen(3001, () => console.log("Servidor a http://localhost:3001"));