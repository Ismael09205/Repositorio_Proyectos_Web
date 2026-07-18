const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

// Ruta para obtener el perfil del estudiante (Protegida)
router.get("/profile", authMiddleware, userController.getProfile);

// Ruta para actualizar los datos del perfil (Protegida)
router.put("/profile", authMiddleware, userController.updateProfile);

module.exports = router;