const userService = require('../services/user.service');

// Obtener el perfil del usuario (Estudiante o Administrador)
const getProfile = async (req, res) => {
    try {
        // El servicio ya busca automáticamente en cascada y trae el rol correcto
        const profile = await userService.getProfileById(req.user.id);

        return res.status(200).json({
            ...profile,
            email: req.user.email // Mantenemos el correo que viene de Supabase Auth
        });

    } catch (error) {
        console.error('>>>> [DEBUG GETPROFILE] ERROR CRÍTICO CAPTURADO:', error);
        return res.status(500).json({ error: error.message || 'Error interno del servidor.' });
    }
}

// Actualizar los datos del perfil de forma segura según el rol
const updateProfile = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: 'Datos de perfil requeridos.' });
        }

        // Validaciones dinámicas en el body según el campo que mande el frontend
        if (req.body.nombre_completo !== undefined && (!req.body.nombre_completo || !String(req.body.nombre_completo).trim())) {
             return res.status(400).json({ error: 'El nombre completo es requerido.' });
        }

        if (req.body.name !== undefined && (!req.body.name || !String(req.body.name).trim())) {
             return res.status(400).json({ error: 'El nombre completo es requerido.' });
        }

        // Pasamos el ID y el body al servicio, que ya sabe discriminar por rol
        const updatedProfile = await userService.updateProfileById(req.user.id, req.body);

        return res.status(200).json({
            ...updatedProfile,
            email: req.user.email
        });
    } catch (error) {
        console.error('updateProfile error:', error);
        return res.status(400).json({ error: error.message || 'Error al actualizar los datos del perfil.' });
    }
}

// Subir/actualizar el avatar del usuario logueado (Estudiante o Administrador)
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió ningún archivo.' });
        }

        const updatedProfile = await userService.uploadAvatarById(req.user.id, req.file);

        return res.status(200).json({
            ...updatedProfile,
            email: req.user.email
        });
    } catch (error) {
        console.error('uploadAvatar error:', error);
        return res.status(400).json({ error: error.message || 'Error al subir el avatar.' });
    }
}

module.exports = {
    getProfile,
    updateProfile,
    uploadAvatar
};