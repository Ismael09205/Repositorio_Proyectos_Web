const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');


router.post("/register", authController.register);
router.post("/register-admin", authController.registerAdmin); 

router.post("/login", authController.login);
router.post("/recover", authController.recover);
router.post("/change-password", authController.changePassword);

router.get("/change-password", (req, res) => {
  // Fallback: si Supabase redirige por GET a backend, reenviamos al frontend.
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  return res.redirect(`${frontendBase}/reset-password${query}`);
});

module.exports = router;