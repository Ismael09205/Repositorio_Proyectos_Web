const userService = require('../services/user.service');
const { supabaseService } = require('../config/supabase');

// Función para obtener el perfil del usuario autenticado, 
// se asume que el middleware de autenticación ya ha verificado 
// el token y ha agregado la información del usuario al objeto de la petición (req.user)
// Esta es la función que manda a llamar el frontend justo al iniciar sesión
const getProfile = async (req, res) => {
    try {
        // 1. Intentamos buscar PRIMERO en la tabla de administradores
        const { data: adminData, error: adminError } = await supabaseService
            .from('administrators')
            .select('*')
            .eq('id', req.user.id)
            .maybeSingle(); // Si da 0 filas, retorna null de forma segura sin explotar

        if (adminError) {
            console.error(">>>> [DEBUG GETPROFILE] Error al consultar tabla administrators:", adminError);
            throw adminError;
        }

        let profile = null;

        if (adminData) {
            profile = adminData;
        } else {
            // Si no está en administrators, es un estudiante común y corriente
            profile = await userService.getProfileById(req.user.id, req.user.user_metadata);
        }

        if (!profile) {
            return res.status(404).json({ error: 'No se encontró el perfil en el sistema.' });
        }

        return res.status(200).json({
            ...profile,
            email: req.user.email
        });

    } catch (error) {
        console.error('>>>> [DEBUG GETPROFILE] ERROR CRÍTICO CAPTURADO:', error);
        return res.status(500).json({ error: error.message || 'Error interno del servidor.' });
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