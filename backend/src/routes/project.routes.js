const express = require('express');
const router = express.Router();

const projectController = require('../controllers/project.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/mine', authMiddleware, projectController.getMyProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', authMiddleware, projectController.createProject);

module.exports = router;
