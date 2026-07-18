const { supabaseService } = require('../config/supabase');

async function getAllUsers() {
    try {
        const { data: authUsers, error: authError } = await supabaseService.auth.admin.listUsers();
        
        if (authError) throw authError;

        const { data: profiles, error: profilesError } = await supabaseService
            .from('profiles')
            .select('*');

        const { data: administrators, error: adminsError } = await supabaseService
            .from('administrators')
            .select('*');

        if (profilesError || adminsError) {
            throw new Error('Error fetching user profiles');
        }

        const users = authUsers.users
            .filter(authUser => !authUser.banned_until)
            .map(authUser => {
            const profile = profiles?.find(p => p.id === authUser.id);
            const admin = administrators?.find(a => a.id === authUser.id);
            
            return {
                id: authUser.id,
                email: authUser.email,
                created_at: authUser.created_at,
                last_sign_in_at: authUser.last_sign_in_at,
                is_active: !authUser.banned_until,
                banned_until: authUser.banned_until,
                role: admin ? 'admin' : 'student',
                profile: admin || profile || null,
                name: admin ? admin.name : profile?.nombre_completo || 'Sin nombre',
                avatar_url: admin ? admin.avatar_url : profile?.avatar_url || null
            };
        });

        return users;
    } catch (error) {
        console.error('getAllUsers error:', error);
        throw error;
    }
}

/**
 * Get a single user by ID with full details
 */
async function getUserById(userId) {
    try {
        const { data: authUser, error: authError } = await supabaseService.auth.admin.getUserById(userId);
        
        if (authError) throw authError;

        const { data: profile } = await supabaseService
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        const { data: admin } = await supabaseService
            .from('administrators')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        return {
            id: authUser.user.id,
            email: authUser.user.email,
            created_at: authUser.user.created_at,
            last_sign_in_at: authUser.user.last_sign_in_at,
            is_active: !authUser.user.banned_until,
            banned_until: authUser.user.banned_until,
            role: admin ? 'admin' : 'student',
            profile: admin || profile || null,
            name: admin ? admin.name : profile?.nombre_completo || 'Sin nombre',
            avatar_url: admin ? admin.avatar_url : profile?.avatar_url || null
        };
    } catch (error) {
        console.error('getUserById error:', error);
        throw error;
    }
}

/**
 * Update user profile (student or admin)
 */
async function updateUser(userId, updateData) {
    try {
        const { data: admin } = await supabaseService
            .from('administrators')
            .select('id')
            .eq('id', userId)
            .maybeSingle();

        const isAdmin = !!admin;

        if (isAdmin) {
            const { data, error } = await supabaseService
                .from('administrators')
                .update({
                    name: updateData.name,
                    username: updateData.username,
                    cargo: updateData.cargo,
                    especialidad: updateData.especialidad,
                    sector: updateData.sector,
                    avatar_url: updateData.avatar_url
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabaseService
                .from('profiles')
                .update({
                    nombre_completo: updateData.nombre_completo,
                    universidad: updateData.universidad,
                    facultad: updateData.facultad,
                    carrera: updateData.carrera,
                    semestre: updateData.semestre,
                    ciudad: updateData.ciudad,
                    biografia: updateData.biografia,
                    intereses: updateData.intereses,
                    github_url: updateData.github_url,
                    linkedin_url: updateData.linkedin_url,
                    avatar_url: updateData.avatar_url
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    } catch (error) {
        console.error('updateUser error:', error);
        throw error;
    }
}

/**
 * Delete a user (soft delete by banning permanently)
 */
async function deleteUser(userId) {
    try {
        const { data, error } = await supabaseService.auth.admin.updateUserById(
            userId,
            { ban_duration: '876000h' }
        );

        if (error) throw error;
        return { success: true, message: 'Usuario eliminado correctamente' };
    } catch (error) {
        console.error('deleteUser error:', error);
        throw error;
    }
}

/**
 * Deactivate user account temporarily (ban for specified duration)
 */
async function deactivateUser(userId, duration = '720h') {
    try {
        const { data, error } = await supabaseService.auth.admin.updateUserById(
            userId,
            { ban_duration: duration }
        );

        if (error) throw error;
        return { success: true, message: 'Usuario desactivado temporalmente', banned_until: data.user.banned_until };
    } catch (error) {
        console.error('deactivateUser error:', error);
        throw error;
    }
}

/**
 * Activate user account (remove ban)
 */
async function activateUser(userId) {
    try {
        const { data, error } = await supabaseService.auth.admin.updateUserById(
            userId,
            { ban_duration: 'none' }
        );

        if (error) throw error;
        return { success: true, message: 'Usuario activado correctamente' };
    } catch (error) {
        console.error('activateUser error:', error);
        throw error;
    }
}

/**
 * Search users by email or name
 */
async function searchUsers(query) {
    try {
        const allUsers = await getAllUsers();
        
        const searchTerm = query.toLowerCase();
        const filtered = allUsers.filter(user => 
            user.email.toLowerCase().includes(searchTerm) ||
            user.name.toLowerCase().includes(searchTerm)
        );

        return filtered;
    } catch (error) {
        console.error('searchUsers error:', error);
        throw error;
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    deactivateUser,
    activateUser,
    searchUsers
};