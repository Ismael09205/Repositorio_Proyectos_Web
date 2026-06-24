const express = require('express');
const router = express.Router();
const adminUsersController = require('../controllers/adminUsers.controller');
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

router.use(authMiddleware);
router.use(isAdmin);

router.get('/', adminUsersController.getAllUsers);
router.get('/search', adminUsersController.searchUsers);
router.get('/:userId', adminUsersController.getUserById);
router.put('/:userId', adminUsersController.updateUser);
router.delete('/:userId', adminUsersController.deleteUser);
router.post('/:userId/deactivate', adminUsersController.deactivateUser);
router.post('/:userId/activate', adminUsersController.activateUser);

module.exports = router;