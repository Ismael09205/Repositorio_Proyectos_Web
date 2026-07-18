const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chat.controller');
const {authMiddleware} = require('../middlewares/auth.middleware');

// Ruta para obtener todas las conversaciones del usuario autenticado (Protegida)
router.get('/conversaciones', authMiddleware, chatController.obtenerConversaciones);

// Ruta para iniciar o recuperar una conversación con otro usuario (Protegida)
router.post('/conversaciones', authMiddleware, chatController.iniciarConversacion);

// Ruta para obtener el historial de mensajes de una conversación (Protegida)
router.get('/conversaciones/:conversacion_id/mensajes', authMiddleware, chatController.obtenerMensajes);

// 🔥 AQUÍ ESTÁ LA RUTA NUEVA QUE FALTABA 🔥
router.get('/buscar-usuarios', authMiddleware, chatController.buscarUsuarios);


module.exports = router;