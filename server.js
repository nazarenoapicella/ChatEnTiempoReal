const express = require('express');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app); // Crea un servidor HTTP
const io = new Server(server); // Configura Socket.IO

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Archivo de mensajes
const MESSAGE_FILE = './messages.json';

// Página principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Ruta para obtener mensajes
app.get('/api/messages', (req, res) => {
  if (fs.existsSync(MESSAGE_FILE)) {
    const messages = JSON.parse(fs.readFileSync(MESSAGE_FILE, 'utf8'));
    res.json(messages);
  } else {
    res.json([]); // Si no hay mensajes, devuelve un array vacío
  }
});

// Socket.IO: conexión de usuarios
io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado');

  // Enviar mensajes existentes al nuevo usuario
  if (fs.existsSync(MESSAGE_FILE)) {
    const messages = JSON.parse(fs.readFileSync(MESSAGE_FILE, 'utf8'));
    socket.emit('chat history', messages);
  }

  // Escuchar nuevos mensajes
  socket.on('new message', (data) => {
    const { username, message } = data;

    if (!username || !message) return;

    const newMessage = {
      username,
      message,
      timestamp: new Date().toISOString(),
    };

    // Guardar mensaje
    let messages = [];
    if (fs.existsSync(MESSAGE_FILE)) {
      messages = JSON.parse(fs.readFileSync(MESSAGE_FILE, 'utf8'));
    }
    messages.push(newMessage);
    fs.writeFileSync(MESSAGE_FILE, JSON.stringify(messages, null, 2));

    // Enviar mensaje a todos los clientes
    io.emit('new message', newMessage);
  });

  // Detectar desconexión
  socket.on('disconnect', () => {
    console.log('Un usuario se ha desconectado');
  });
});

// Servidor en el puerto adecuado
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
