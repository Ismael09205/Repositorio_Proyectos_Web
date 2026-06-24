const registrarChatSocket = require('./chat.socket');

// Registra todos los manejadores de eventos WebSocket de la aplicación
const registrarSockets = (io) => {
    registrarChatSocket(io);
};

module.exports = registrarSockets;