const chatService = require('../services/chat.service');

// Función para obtener todas las conversaciones del usuario autenticado
const obtenerConversaciones = async (req, res) => {
    try {
        const conversaciones = await chatService.obtenerConversacionesPorUsuario(req.user.id);
        return res.status(200).json({ conversaciones });
    } catch (error) {
        console.error('obtenerConversaciones error:', error);
        return res.status(500).json({ error: error.message || 'Error obteniendo las conversaciones.' });
    }
};

// Función para obtener el historial de mensajes de una conversación específica
const obtenerMensajes = async (req, res) => {
    try {
        const { conversacion_id } = req.params;
        const mensajes = await chatService.obtenerMensajes(conversacion_id);
        return res.status(200).json({ mensajes });
    } catch (error) {
        console.error('obtenerMensajes error:', error);
        return res.status(500).json({ error: error.message || 'Error obteniendo los mensajes.' });
    }
};

// Función para iniciar o recuperar una conversación directa con otro usuario
const iniciarConversacion = async (req, res) => {
    try {
        const { receptor_id } = req.body;

        if (!receptor_id) {
            return res.status(400).json({ error: 'El ID del receptor es requerido.' });
        }

        if (receptor_id === req.user.id) {
            return res.status(400).json({ error: 'No puedes iniciar una conversación contigo mismo.' });
        }

        const conversacion = await chatService.obtenerOCrearConversacion(req.user.id, receptor_id);
        return res.status(200).json({ conversacion });
    } catch (error) {
        console.error('iniciarConversacion error:', error);
        return res.status(500).json({ error: error.message || 'Error iniciando la conversación.' });
    }
};

// 🔥 AQUÍ ESTÁ LA FUNCIÓN NUEVA QUE FALTABA PARA EL BUSCADOR 🔥
const buscarUsuarios = async (req, res) => {
    try {
        const { q } = req.query; 
        if (!q || q.trim().length === 0) {
            return res.status(200).json({ usuarios: [] });
        }
        const usuarios = await chatService.buscarUsuarios(q, req.user.id);
        return res.status(200).json({ usuarios });
    } catch (error) {
        console.error('buscarUsuarios error:', error);
        return res.status(500).json({ error: 'Error buscando usuarios' });
    }
};

module.exports = {
    obtenerConversaciones,
    obtenerMensajes,
    iniciarConversacion,
    buscarUsuarios 
};