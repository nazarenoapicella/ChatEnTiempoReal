const socket = io();
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');

// Verificar si el nombre de usuario ya está almacenado
const savedUsername = localStorage.getItem('username');
if (savedUsername) {
  // Si ya está guardado, unirse al chat automáticamente
  socket.emit('setUsername', savedUsername);
  authContainer.style.display = 'none';
  chatContainer.style.display = 'block';
}

// Recibir mensajes del servidor
socket.on('loadMessages', (messages) => {
  messages.forEach(msg => {
    displayMessage(msg);
  });
});

socket.on('receiveMessage', (message) => {
  displayMessage(message);
});

// Mostrar un mensaje en la interfaz
function displayMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.textContent = `${message.user}: ${message.text}`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Para mantener la vista en el último mensaje
}

// Unirse al chat
joinBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (username) {
    // Guardar el nombre de usuario en localStorage
    localStorage.setItem('username', username);

    socket.emit('setUsername', username);
    authContainer.style.display = 'none';
    chatContainer.style.display = 'block';
  } else {
    alert('Por favor, ingresa un nombre de usuario');
  }
});

// Enviar mensaje al servidor
sendBtn.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('sendMessage', message);
    messageInput.value = ''; // Limpiar el input
  }
});

// Asegurarse de que el mensaje se envíe cuando el usuario presiona Enter
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendBtn.click();
  }
});
