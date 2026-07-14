const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const {authMiddleware} = require('../middlewares/auth.middleware');

router.get('/mine', authMiddleware, projectController.getMyProjects);
router.post('/', authMiddleware, projectController.createProject);
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/:projectId/like', authMiddleware, projectController.toggleLike);
router.get('/:projectId/comments', projectController.getComments);
router.post('/:projectId/comments', authMiddleware, projectController.addComment);

module.exports = router;
