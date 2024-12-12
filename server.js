const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Archivo donde se guardan los mensajes
const MESSAGE_FILE = './messages.json';

// Ruta para obtener mensajes
app.get('/api/messages', (req, res) => {
  if (fs.existsSync(MESSAGE_FILE)) {
    const messages = JSON.parse(fs.readFileSync(MESSAGE_FILE, 'utf8'));
    res.json(messages);
  } else {
    res.json([]); // Si no existe el archivo, se devuelve un array vacío
  }
});

// Ruta para enviar un mensaje
app.post('/api/messages', (req, res) => {
  const { username, message } = req.body;
  if (!username || !message) {
    return res.status(400).json({ error: 'Faltan datos: username o message' });
  }

  const newMessage = { username, message, timestamp: new Date().toISOString() };

  let messages = [];
  if (fs.existsSync(MESSAGE_FILE)) {
    messages = JSON.parse(fs.readFileSync(MESSAGE_FILE, 'utf8'));
  }

  messages.push(newMessage);

  fs.writeFileSync(MESSAGE_FILE, JSON.stringify(messages, null, 2));
  res.status(201).json({ success: true });
});

// Servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
