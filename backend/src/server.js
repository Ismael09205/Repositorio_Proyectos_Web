require('dotenv').config(); 
const http = require('http'); // chat
const app = require('./app');
const { inicializarSocket } = require('./config/socket'); //chat
const registerSockets = require('./sockets/index'); //chat
const socketAuthMiddleware = require('./middlewares/socket.middleware');//chat

const PORT = process.env.PORT || 3000;
 
// Creamos el servidor HTTP a partir de Express
const server = http.createServer(app);
 
// Inicializamos Socket.io sobre el servidor HTTP
const io = inicializarSocket(server);
 
// Aplicamos el middleware de autenticación a todas las conexiones WebSocket
io.use(socketAuthMiddleware);
 
// Registramos todos los eventos de los sockets
registerSockets(io);

server.listen(PORT, () => {
  console.log(`Servidor activo y escuchando en el puerto ${PORT}`);
});


process.on('SIGINT', () => {
  server.close(() => {
    console.log('Servidor apagado manualmente');
    process.exit(0);
  });
});