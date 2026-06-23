const userService = require('../services/user.service');

// Función para obtener el perfil del usuario autenticado, 
// se asume que el middleware de autenticación ya ha verificado 
// el token y ha agregado la información del usuario al objeto de la petición (req.user)
const getProfile = async (req, res) => {
    try {
        // Consultamos al servicio para traer los datos extendidos de la tabla 'profiles'
        const profile = await userService.getProfileById(req.user.id, req.user.user_metadata);

        // Devolvemos los datos del perfil combinados con el email oficial de la autenticación
        return res.status(200).json({
            ...profile,
            email: req.user.email
        });
    } catch (error) {
        console.error('getProfile error:', error);
        // Si no encuentra el perfil o hay un fallo, manejamos el estado de error
        return res.status(404).json({ error: error.message || 'No se encontró el perfil del estudiante en IdeAgora.' });
    }
}

// Función para actualizar los datos de la ficha extendida del estudiante
const updateProfile = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: 'Datos de perfil requeridos.' });
        }

        // Validacion minima para que el perfil sea coherente
        if (!req.body.nombre_completo || !String(req.body.nombre_completo).trim()) {
            return res.status(400).json({ error: 'El nombre completo es requerido.' });
        }

        // Enviamos al servicio el ID del usuario autenticado y el cuerpo con los nuevos cambios
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

// Exportamos de forma limpia los controladores para usarlos en tus rutas de usuario
module.exports = {
    getProfile,
    updateProfile
};