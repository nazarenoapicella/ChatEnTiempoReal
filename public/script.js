const socket = io(); // Conexión con el servidor

const joinForm = document.getElementById('join-form');
const chatBox = document.getElementById('chat-box');
const messagesList = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message');

let username;

// Unirse al chat
joinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  username = document.getElementById('username').value.trim();
  if (username) {
    localStorage.setItem('username', username);
    joinForm.style.display = 'none';
    chatBox.style.display = 'block';
  }
});

// Cargar mensajes anteriores
socket.on('chat history', (messages) => {
  messages.forEach(({ username, message, timestamp }) => {
    addMessage(username, message, timestamp);
  });
});

// Recibir nuevos mensajes
socket.on('new message', ({ username, message, timestamp }) => {
  addMessage(username, message, timestamp);
});

// Enviar mensajes
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('new message', { username, message });
    messageInput.value = '';
  }
});

// Agregar un mensaje al DOM
function addMessage(username, message, timestamp) {
  const li = document.createElement('li');
  li.textContent = `[${new Date(timestamp).toLocaleTimeString()}] ${username}: ${message}`;
  messagesList.appendChild(li);
  messagesList.scrollTop = messagesList.scrollHeight;
}
