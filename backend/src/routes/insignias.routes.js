const express = require('express');
const router = express.Router();
const insigniasController = require('../controllers/insignias.controller');
const projectController   = require('../controllers/project.controller');
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware');

/* Todas las rutas requieren autenticacion y rol administrador */
router.use(authMiddleware);
router.use(isAdmin);

/* GET /api/admin/insignias - Lista usuarios con sus insignias */
router.get('/', insigniasController.listarInsignias);

/* GET /api/admin/insignias/estadisticas - Stats para el dashboard */
router.get('/estadisticas', insigniasController.obtenerEstadisticas);

/* POST /api/admin/insignias/:usuarioId - Asigna insignia a un usuario */
router.post('/:usuarioId', insigniasController.asignarInsignia);

/* DELETE /api/admin/insignias/:usuarioId - Remueve insignia manual */
router.delete('/:usuarioId', insigniasController.removerInsignia);

module.exports = router;
