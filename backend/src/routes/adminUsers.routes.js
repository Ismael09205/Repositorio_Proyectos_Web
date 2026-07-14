const express = require('express');
const router = express.Router();
const adminUsersController = require('../controllers/adminUsers.controller');
const { authMiddleware, isAdmin } = require('../middlewares/auth.middleware');

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