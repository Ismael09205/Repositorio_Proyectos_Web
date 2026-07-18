const express = require('express');
const router = express.Router();
const authLogsController = require('../controllers/authLogs.controller');
const {authMiddleware,isAdmin} = require('../middlewares/auth.middleware');

router.use(authMiddleware);
router.use(isAdmin);

// Rutas limpias, directo al grano
router.get('/', authLogsController.getAllLogs);
router.get('/statistics', authLogsController.getLogStatistics);
router.get('/action/:action', authLogsController.getLogsByAction);
router.get('/user/:userId', authLogsController.getLogsByUser);
router.get('/date-range', authLogsController.getLogsByDateRange);

module.exports = router;
