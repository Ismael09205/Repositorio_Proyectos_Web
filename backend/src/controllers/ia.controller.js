const { aiService } = require('../services/ia.service.js');

const consultarIA = async (req, res) => {
  try {
    const { mensaje } = req.body;

    // Validación básica de entrada
    if (!mensaje || !mensaje.trim()) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    // Llamamos al servicio que conecta con Supabase y Qwen 2.5
    const respuesta = await aiService.responderConsulta(mensaje.trim());

    return res.status(200).json({ respuesta });
  } catch (error) {
    console.error('Error en consultarIA:', error);
    return res.status(500).json({ 
      error: error.message || 'Error interno al procesar la consulta con la IA.' 
    });
  }
};

module.exports = {
  consultarIA
};