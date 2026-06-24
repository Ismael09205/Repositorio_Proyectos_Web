const express = require('express');
const router = express.Router();
const authLogsController = require('../controllers/authLogs.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const isAdmin = async (req, res, next) => {
  try {
    const { supabaseService } = require('../config/supabase');
    
    const { data, error } = await supabaseService
      .from('administrators')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(403).json({
        error: 'Acceso denegado. Solo administradores pueden acceder a esta funcionalidad.'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.get('/', authMiddleware, isAdmin, authLogsController.getAllLogs);
router.get('/statistics', authMiddleware, isAdmin, authLogsController.getLogStatistics);
router.get('/action/:action', authMiddleware, isAdmin, authLogsController.getLogsByAction);
router.get('/user/:userId', authMiddleware, isAdmin, authLogsController.getLogsByUser);
router.get('/date-range', authMiddleware, isAdmin, authLogsController.getLogsByDateRange);

module.exports = router;
