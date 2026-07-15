// backend/src/routes/ia.routes.js
const express = require('express');
const router = express.Router();
const { aiService } = require('../services/ia.service');

// Definimos el endpoint POST /api/ia/consultar
router.post('/consultar', async (req, res) => {
    try {
        const { mensaje } = req.body;

        if (!mensaje) {
            return res.status(400).json({ error: 'El mensaje es requerido.' });
        }

        // Llamamos al servicio que interactúa con el Mock / Hugging Face
        const respuestaIA = await aiService.responderConsulta(mensaje);

        // Retornamos la respuesta estructurada tal como la espera tu frontend
        return res.status(200).json({ respuesta: respuestaIA });
    } catch (error) {
        console.error("Error en el controlador de IA:", error);
        return res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
});

module.exports = router;