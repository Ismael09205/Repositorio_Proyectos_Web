// backend/middlewares/projectMiddleware.js
const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó un token.',
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Decodificamos el token de Supabase para obtener el ID del usuario (sub)
    const decoded = jwt.decode(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.',
      });
    }

    // Guardamos los datos del usuario en la petición para usarlos en el controlador
    req.user = {
      id: decoded.sub,
      email: decoded.email
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado.',
    });
  }
};

module.exports = { requireAuth };