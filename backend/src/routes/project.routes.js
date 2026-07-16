const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const {authMiddleware} = require('../middlewares/auth.middleware');
const { requireAuth } = require('../middlewares/project.middleware');

router.get('/mine', authMiddleware, projectController.getMyProjects);
router.post('/', authMiddleware, projectController.createProject);
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/:projectId/like', authMiddleware, projectController.toggleLike);

// COMENTARIOS
// Agregamos una ruta opcional con un middleware suave o simplemente pasamos el token para saber si el usuario logueado dio like a los comentarios
router.get('/:projectId/comments', projectController.getComments);
router.post('/:projectId/comments', authMiddleware, projectController.addComment);
router.post('/:projectId/comments/:commentId/like', authMiddleware, projectController.toggleCommentLike); 

// Nueva ruta actualizar proyecto
router.put('/:id', requireAuth, projectController.updateProject);

//Eliminar Proyecto
router.delete('/:id', requireAuth, projectController.deleteProject);

module.exports = router;
