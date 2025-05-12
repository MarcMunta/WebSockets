const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const documentRoutes = require('./routes/documents');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);
app.use('/documents', documentRoutes);
app.use('/documents/files', express.static(__dirname + '/public/uploads'));

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

let messages = [];
let currentDocument = '';
const docPath = './data/shared_document.txt';

// Cargar documento inicial si existe
if (fs.existsSync(docPath)) {
  currentDocument = fs.readFileSync(docPath, 'utf-8');
}

io.on('connection', (socket) => {
  console.log('Usuari connectat');

  // Enviar document inicial
  socket.emit('init_document', currentDocument);

  // Rebre i reenviar missatge de xat
  socket.on('send_message', (data) => {
    messages.push(data);
    fs.writeFileSync('./data/messages.json', JSON.stringify(messages, null, 2));
    io.emit('receive_message', data);
  });

  // Rebre edició de document
  socket.on('edit_document', (data) => {
    currentDocument = data;
    io.emit('document_update', data); // enviar a tots
  });
});

// Autosave cada 10 segons
setInterval(() => {
  fs.writeFileSync(docPath, currentDocument);
}, 10000);

server.listen(3001, () => console.log('Servidor a http://localhost:3001'));
