const { Server } = require('socket.io');

let io;

const inicializarSocket = (servidorHttp) => {
    io = new Server(servidorHttp, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    return io;
};

const obtenerIO = () => {
    if (!io) throw new Error('Socket.io no ha sido inicializado.');
    return io;
};

module.exports = { inicializarSocket, obtenerIO };