const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const documentRoutes = require('./routes/documents');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);
app.use('/documents', documentRoutes);

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

let messages = [];

io.on('connection', (socket) => {
  console.log('Usuari connectat');
  socket.on('send_message', (data) => {
    messages.push(data);
    fs.writeFileSync('./data/messages.json', JSON.stringify(messages, null, 2));
    io.emit('receive_message', data);
  });
  socket.on('edit_document', (data) => {
    io.emit('document_update', data);
  });
});

server.listen(3001, () => console.log('Servidor a http://localhost:3001'));