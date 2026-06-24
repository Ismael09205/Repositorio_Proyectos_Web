const { supabaseAnon } = require('../config/supabase');

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
            return res.status(401).json({ error: 'El token de autenticación es inválido o ha expirado' });
        }

        // Inyectamos el usuario verificado en la petición para usarlo en los controladores
        req.user = data.user;
        
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Exportamos la función de manera limpia para que la uses en tus archivos de rutas
module.exports = authMiddleware;