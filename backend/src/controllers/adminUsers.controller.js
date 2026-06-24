const adminUsersService = require('../services/adminUsers.service');

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await adminUsersService.getAllUsers();
        return res.status(200).json(users);
    } catch (error) {
        console.error('getAllUsers controller error:', error);
        return res.status(500).json({ 
            error: 'Error al obtener la lista de usuarios',
            details: error.message 
        });
    }
};

/**
 * Get user by ID (admin only)
 */
const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ error: 'ID de usuario requerido' });
        }

        const user = await adminUsersService.getUserById(userId);
        return res.status(200).json(user);
    } catch (error) {
        console.error('getUserById controller error:', error);
        return res.status(404).json({ 
            error: 'Usuario no encontrado',
            details: error.message 
        });
    }
};

/**
 * Update user profile (admin only)
 */
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'ID de usuario requerido' });
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'Datos de actualización requeridos' });
        }

        const updatedUser = await adminUsersService.updateUser(userId, updateData);
        return res.status(200).json({
            success: true,
            message: 'Usuario actualizado correctamente',
            user: updatedUser
        });
    } catch (error) {
        console.error('updateUser controller error:', error);
        return res.status(400).json({ 
            error: 'Error al actualizar usuario',
            details: error.message 
        });
    }
};

/**
 * Delete user (admin only) - Soft delete via permanent ban
 */
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'ID de usuario requerido' });
        }

        // Prevent admin from deleting themselves
        if (userId === req.user.id) {
            return res.status(403).json({ error: 'No puedes eliminar tu propia cuenta' });
        }

        const result = await adminUsersService.deleteUser(userId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('deleteUser controller error:', error);
        return res.status(400).json({ 
            error: 'Error al eliminar usuario',
            details: error.message 
        });
    }
};

/**
 * Deactivate user temporarily (admin only)
 */
const deactivateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { duration } = req.body; // Duration in hours, e.g., "720h" for 30 days

        if (!userId) {
            return res.status(400).json({ error: 'ID de usuario requerido' });
        }

        // Prevent admin from deactivating themselves
        if (userId === req.user.id) {
            return res.status(403).json({ error: 'No puedes desactivar tu propia cuenta' });
        }

        const result = await adminUsersService.deactivateUser(userId, duration || '720h');
        return res.status(200).json(result);
    } catch (error) {
        console.error('deactivateUser controller error:', error);
        return res.status(400).json({ 
            error: 'Error al desactivar usuario',
            details: error.message 
        });
    }
};

/**
 * Activate user (remove ban) (admin only)
 */
const activateUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'ID de usuario requerido' });
        }

        const result = await adminUsersService.activateUser(userId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('activateUser controller error:', error);
        return res.status(400).json({ 
            error: 'Error al activar usuario',
            details: error.message 
        });
    }
};

/**
 * Search users by email or name (admin only)
 */
const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim() === '') {
            return res.status(400).json({ error: 'Término de búsqueda requerido' });
        }

        const users = await adminUsersService.searchUsers(query);
        return res.status(200).json(users);
    } catch (error) {
        console.error('searchUsers controller error:', error);
        return res.status(500).json({ 
            error: 'Error al buscar usuarios',
            details: error.message 
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    deactivateUser,
    activateUser,
    searchUsers
};

// Made with Bob