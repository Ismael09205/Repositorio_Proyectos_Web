const chatService = require('../services/chat.service');

// Un Set en memoria para guardar los IDs de los usuarios que tienen una sesión de socket activa
const usuariosConectados = new Set();

// Registra todos los eventos del chat en tiempo real para cada conexión WebSocket
const registrarChatSocket = (io) => {
    io.on('connection', (socket) => {
        const userId = socket.user.id;
        console.log(`Usuario conectado al chat: ${userId}`);

        // 1. Añadimos el usuario al registro global de conectados
        usuariosConectados.add(userId);

        // 2. Emitimos la lista actualizada de usuarios conectados a TODO el mundo
        io.emit('usuarios_online', Array.from(usuariosConectados));

        // El usuario se une a su sala personal para recibir notificaciones dirigidas a él
        socket.join(`usuario:${userId}`);

        // ─── EVENTO: unirse a una conversación ───────────────────────────────
        socket.on('unirse_conversacion', async ({ conversacion_id }) => {
            try {
                socket.join(`conv:${conversacion_id}`);

                // Marcamos los mensajes como leídos al abrir la conversación
                await chatService.marcarComoLeidos(conversacion_id, userId);

                // Enviamos el historial de mensajes al usuario que acaba de unirse
                const mensajes = await chatService.obtenerMensajes(conversacion_id);
                socket.emit('historial_mensajes', { conversacion_id, mensajes });
            } catch (error) {
                socket.emit('error_chat', { mensaje: 'Error al unirse a la conversación.' });
            }
        });

        // ─── EVENTO: enviar mensaje ───────────────────────────────────────────
        socket.on('enviar_mensaje', async ({ conversacion_id, receptor_id, contenido }) => {
            try {
                if (!contenido || !String(contenido).trim()) {
                    return socket.emit('error_chat', { mensaje: 'El mensaje no puede estar vacío.' });
                }

                if (!conversacion_id || !receptor_id) {
                    return socket.emit('error_chat', { mensaje: 'Faltan datos para enviar el mensaje.' });
                }

                // Guardamos el mensaje en Supabase
                const mensaje = await chatService.guardarMensaje({
                    conversacion_id,
                    emisor_id: userId,
                    contenido: String(contenido).trim(),
                });

                // Emitimos el mensaje a todos los participantes que están en la sala de esa conversación
                io.to(`conv:${conversacion_id}`).emit('nuevo_mensaje', mensaje);

                // Notificamos al receptor en su sala personal por si no tiene el chat abierto
                io.to(`usuario:${receptor_id}`).emit('conversacion_actualizada', {
                    conversacion_id,
                    ultimo_mensaje: mensaje,
                });
            } catch (error) {
                console.error('enviar_mensaje error:', error);
                socket.emit('error_chat', { mensaje: 'Error al enviar el mensaje.' });
            }
        });

        // ─── EVENTO: salir de una conversación ───────────────────────────────
        socket.on('salir_conversacion', ({ conversacion_id }) => {
            socket.leave(`conv:${conversacion_id}`);
        });

        // ─── EVENTO: desconexión ──────────────────────────────────────────────
        socket.on('disconnect', () => {
            console.log(`Usuario desconectado del chat: ${userId}`);

            // 1. Removemos al usuario del Set de conectados
            usuariosConectados.delete(userId);

            // 2. Notificamos la lista actualizada para que en el frontend se apague su puntito verde de inmediato
            io.emit('usuarios_online', Array.from(usuariosConectados));
        });
    });
};

module.exports = registrarChatSocket;