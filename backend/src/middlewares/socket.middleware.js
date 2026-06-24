const { supabaseAnon } = require('../config/supabase');

// Middleware para verificar si el usuario está autenticado antes de permitir la conexión WebSocket.
// Funciona igual que el authMiddleware de HTTP pero adaptado para Socket.io
const socketAuthMiddleware = async (socket, next) => {
    try {
        // Extraemos el token desde el handshake de Socket.io
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

        if (!token) {
            return next(new Error('No hay un token de autenticación válido para la conexión WebSocket'));
        }

        // Validamos el token usando el cliente configurado de Supabase
        const { data, error } = await supabaseAnon.auth.getUser(token);

        if (error || !data || !data.user) {
            return next(new Error('El token de autenticación es inválido o ha expirado'));
        }

        // Inyectamos el usuario verificado en el socket para usarlo en los eventos
        socket.user = data.user;

        next();
    } catch (error) {
        next(new Error(error.message));
    }
};

// Exportamos el middleware para usarlo en la inicialización del servidor
module.exports = socketAuthMiddleware;