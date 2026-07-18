const { supabaseAnon } = require('../config/supabase');
const userService = require('../services/user.service');

// Middleware para verificar si el usuario está autenticado o no.
// Se verifica el token de autenticación que se envía en el header de la petición.
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Validamos que exista el header y que use el formato estándar 'Bearer <token>'
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No hay un token de autenticación válido o falta el formato Bearer' });
        }

        // Extraemos el token eliminando la palabra 'Bearer '
        const token = authHeader.split(' ')[1];

        // Validamos el token usando tu cliente configurado
        const { data, error } = await supabaseAnon.auth.getUser(token);

        if (error || !data || !data.user) {
            return res.status(401).json({ error: 'Su sesion ha expirado' });
        }

        // Buscamos el perfil en cascada para obtener el rol real de la base de datos
        try {
            const perfil = await userService.getProfileById(data.user.id);
            // Inyectamos el usuario de auth y le pegamos el rol nativo de tu tabla
            req.user = {
                ...data.user,
                rol: perfil.rol // Aquí va 'estudiante' o 'administrador'
            };
        } catch (perfilError) {
            // Si el token es válido en Auth pero no existe en las tablas de la BD pública
            return res.status(404).json({ error: 'El usuario está autenticado pero no tiene un perfil asignado.' });
        }
        
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// ¡NUEVO! Middleware secundario para proteger rutas exclusivas de administrador
const isAdmin = (req, res, next) => {
    // Como authMiddleware se ejecuta primero, req.user ya tiene el rol inyectado
    if (!req.user || req.user.rol !== 'administrador') {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    next();
}

// Exportamos la función de manera limpia para que lauses en tus archivos de rutas
module.exports = {
    authMiddleware,
    isAdmin
};