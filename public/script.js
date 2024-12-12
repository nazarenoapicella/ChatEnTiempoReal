document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  const joinForm = document.querySelector("#join-form");
  const chatBox = document.querySelector("#chat-box");
  const messagesList = document.querySelector("#messages");
  const messageForm = document.querySelector("#message-form");
  const messageInput = document.querySelector("#message");
  
  let username = localStorage.getItem("username");
  
  // Función para mostrar el chat
  const showChat = () => {
    joinForm.style.display = "none";
    chatBox.style.display = "flex";
  };
  
  // Si hay un usuario guardado, mostrar el chat directamente
  if (username) {
    showChat();
  }
  
  // Manejar el formulario de unión
  joinForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const usernameInput = document.querySelector("#username");
    username = usernameInput.value.trim();
  
    if (username) {
      localStorage.setItem("username", username); // Guardar el nombre en localStorage
      showChat();
    }
  });
  
  // Manejar el envío de mensajes
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
  
    if (text) {
      socket.emit("message", { username, text });
      messageInput.value = "";
    }
  });
  
  // Mostrar mensajes previos
  socket.on("previousMessages", (messages) => {
    messages.forEach((msg) => {
      const li = document.createElement("li");
      li.textContent = `[${msg.timestamp}] ${msg.username}: ${msg.text}`;
      messagesList.appendChild(li);
    });
    messagesList.scrollTop = messagesList.scrollHeight;
  });
  
  // Mostrar mensajes nuevos
  socket.on("message", (msg) => {
    const li = document.createElement("li");
    li.textContent = `[${msg.timestamp}] ${msg.username}: ${msg.text}`;
    messagesList.appendChild(li);
    messagesList.scrollTop = messagesList.scrollHeight;
  });
  
})