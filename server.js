const express = require('express');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});

const io = socketIo(server);

// Leer los mensajes desde el archivo JSON
function readMessages() {
  const messagesPath = path.join(__dirname, 'messages.json');
  if (fs.existsSync(messagesPath)) {
    const data = fs.readFileSync(messagesPath, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

// Guardar los mensajes en el archivo JSON
function saveMessages(messages) {
  const messagesPath = path.join(__dirname, 'messages.json');
  fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2), 'utf8');
}

// Servir los archivos estáticos
app.use(express.static('public'));

// Conexión de clientes con socket.io
io.on('connection', (socket) => {
  console.log('Un usuario se conectó');

  // Enviar los mensajes guardados al nuevo cliente
  socket.emit('loadMessages', readMessages());

  // Escuchar el nombre de usuario del cliente
  socket.on('setUsername', (username) => {
    socket.username = username;
    console.log(`${username} se ha unido al chat`);
  });

  // Escuchar los mensajes que el cliente envía
  socket.on('sendMessage', (message) => {
    if (!socket.username) {
      // Si el usuario no tiene nombre, no procesamos el mensaje
      return;
    }
    const formattedMessage = {
      user: socket.username,
      text: message
    };
    
    const messages = readMessages();
    messages.push(formattedMessage);
    saveMessages(messages);

    // Enviar el mensaje a todos los clientes
    io.emit('receiveMessage', formattedMessage);
  });

  // Cuando un usuario se desconecta
  socket.on('disconnect', () => {
    console.log('Un usuario se desconectó');
  });
});
