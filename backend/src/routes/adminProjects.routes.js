const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware');

/* Todas las rutas requieren autenticacion y rol administrador */
router.use(authMiddleware);
router.use(isAdmin);

/* GET /api/admin/projects — lista todos los proyectos */
router.get('/', projectController.getAllProjects);

/* DELETE /api/admin/projects/:id — elimina cualquier proyecto */
router.delete('/:id', projectController.adminDeleteProject);

module.exports = router;
