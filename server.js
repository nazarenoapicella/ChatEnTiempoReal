const express = require("express");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const messages = JSON.parse(fs.existsSync("messages.json") ? fs.readFileSync("messages.json") : "[]");

const addMessage = (username, text) => {
  const timestamp = new Date().toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    dateStyle: "short",
    timeStyle: "short",
  });
  messages.push({ username, text, timestamp });
  fs.writeFileSync("messages.json", JSON.stringify(messages));
};

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Usuario conectado");

  // Enviar mensajes existentes al nuevo cliente
  socket.emit("previousMessages", messages);

  // Escuchar mensajes nuevos
  socket.on("message", (data) => {
    addMessage(data.username, data.text);
    io.emit("message", { username: data.username, text: data.text, timestamp: new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires", dateStyle: "short", timeStyle: "short" }) });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
