# WebSockets App - Comunicación y Colaboración en Tiempo Real

Este proyecto es una aplicación web construida con React (frontend) y Node.js (backend), utilizando WebSockets para permitir funcionalidades colaborativas en tiempo real como chat, edición de archivos y subida de documentos.

---

## 🚀 Funcionalidades Principales

- 💬 Chat en tiempo real entre múltiples usuarios.
- 📁 Subida y administración de archivos.
- 📝 Edición colaborativa de archivos.
- 🔐 Inicio de sesión básico.

---

## 📦 Estructura del Proyecto

WebSockets-main/
│
├── client/ # Frontend en React
│ ├── public/
│ ├── src/
│ │ ├── App.js
│ │ ├── ChatRoom.js
│ │ ├── FileEditor.js
│ │ ├── FileUploader.js
│ │ └── Login.js
│
├── server/ # Backend con Express + Socket.io
│ ├── routes/
│ │ ├── auth.js
│ │ ├── documents.js
│ │ └── messages.js
│ ├── data/ # Base de datos de mensajes/documentos
│ └── server.js


## 🧠 Componentes Frontend

### `App.js`
- Enrutador principal de la aplicación.
- Controla la navegación entre Login, ChatRoom y FileEditor.

### `Login.js`
- Permite al usuario ingresar su nombre.
- Guarda el nombre en el estado global.

### `ChatRoom.js`
- Componente de chat.
- Usa `socket.io-client` para conectar con el servidor y enviar/recibir mensajes.
- Muestra mensajes actuales e históricos.

### `FileUploader.js`
- Componente para cargar archivos al servidor.
- Utiliza `FormData` y la API `/api/documents/upload`.
---

## 🔌 Endpoints del Backend

### 📁 Auth - `routes/auth.js`

#### `POST /api/auth/login`
- **Entrada**:
  ```json
  { "username": "nombre_usuario" }
Respuesta:
{ "message": "Inicio de sesión exitoso", "username": "nombre_usuario" }

📨 Mensajes - routes/messages.js
GET /api/messages
Descripción: Devuelve el historial completo de mensajes.

POST /api/messages
{ "username": "usuario", "message": "contenido del mensaje" }
Descripción: Guarda un nuevo mensaje.

📄 Documentos - routes/documents.js
GET /api/documents
Descripción: Devuelve una lista de archivos disponibles.

POST /api/documents/upload
Descripción: Permite subir archivos al servidor.

Tipo de contenido: multipart/form-data

GET /api/documents/:filename
Descripción: Devuelve el contenido del archivo especificado.

POST /api/documents/:filename
Entrada:
{ "content": "Nuevo contenido del archivo" }
Descripción: Guarda el nuevo contenido en el archivo.

⚙️ Instalación y Ejecución
📜 Backend

cd server
npm install
node server.js


📜 Frontend 
cd client
npm install
npm start
Abre tu navegador en http://localhost:3000.

🧪 Requisitos
Node.js v14+
npm v6+

