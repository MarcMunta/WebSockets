const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const documentRoutes = require("./routes/documents");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);
app.use("/documents", documentRoutes);
app.use("/documents/files", express.static(__dirname + "/public/uploads"));

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

const filePath = path.join(__dirname, "data", "messages.json");

let messages = [];

// Leer historial si ya existe
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

// Cargar documento inicial si existe
if (fs.existsSync(docPath)) {
  currentDocument = fs.readFileSync(docPath, "utf-8");
}

io.on("connection", (socket) => {
  console.log("Usuari connectat");

  // Enviar document inicial
  socket.emit("init_document", currentDocument);

  socket.on("request_chat_history", () => {
    socket.emit("init_chat_history", messages);
  });

  // ✅ Enviar historial de missatges al connectar
  socket.emit("init_chat_history", messages);

  // Quan arriba un missatge nou
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

// Autosave cada 10 segons
setInterval(() => {
  fs.writeFileSync(docPath, currentDocument);
}, 10000);

// [SAVE_HIST]
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

// [EXPORT_DOC - JSON]
app.get("/messages/export/json", (req, res) => {
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "No hi ha historial de missatges." });
  }
  res.download(filePath, "chat_history.json");
});

// [EXPORT_DOC - TXT]
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

server.listen(3001, () => console.log("Servidor a http://localhost:3001"));
