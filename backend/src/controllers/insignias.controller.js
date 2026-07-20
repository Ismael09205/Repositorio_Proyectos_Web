const insigniasService = require('../services/insignias.service');

/* Lista todos los estudiantes con su insignia actual */
const listarInsignias = async (req, res) => {
  try {
    const datos = await insigniasService.listarInsigniasUsuarios();
    return res.status(200).json(datos);
  } catch (error) {
    console.error('listarInsignias error:', error);
    return res.status(500).json({ error: 'Error al listar insignias', detalles: error.message });
  }
};

/* Asigna una insignia especifica a un usuario */
const asignarInsignia = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { nombreInsignia } = req.body;
    const adminId = req.user.id;

    if (!usuarioId || !nombreInsignia) {
      return res.status(400).json({ error: 'usuarioId y nombreInsignia son requeridos' });
    }

    const resultado = await insigniasService.asignarInsignia(usuarioId, nombreInsignia, adminId);
    return res.status(200).json({ success: true, insignia: resultado });
  } catch (error) {
    console.error('asignarInsignia error:', error);
    return res.status(400).json({ error: error.message || 'Error al asignar insignia' });
  }
};

/* Remueve la insignia manual de un usuario */
const removerInsignia = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const resultado = await insigniasService.removerInsignia(usuarioId);
    return res.status(200).json(resultado);
  } catch (error) {
    console.error('removerInsignia error:', error);
    return res.status(400).json({ error: error.message || 'Error al remover insignia' });
  }
};

/* Retorna estadisticas para el dashboard del administrador */
const obtenerEstadisticas = async (req, res) => {
  try {
    const stats = await insigniasService.obtenerEstadisticas();
    return res.status(200).json(stats);
  } catch (error) {
    console.error('obtenerEstadisticas error:', error);
    return res.status(500).json({ error: 'Error al obtener estadisticas', detalles: error.message });
  }
};

module.exports = {
  listarInsignias,
  asignarInsignia,
  removerInsignia,
  obtenerEstadisticas,
};
