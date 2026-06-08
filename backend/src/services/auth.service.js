const { supabaseAnon, supabaseService } = require('../config/supabase');


// Funcion para registrar un nuevo usuario donde se recibe el email, password y metadata
const registerUser = async (email, password, metadata = {}) => {
    
    const { data, error } = await supabaseAnon.auth.signUp({ 
        email, 
        password,
        options: {
            data: metadata
        }
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
// Funcion para iniciar sesion de un usuario que ya esta previamente registrado
const loginUser = async (email, password) => {
    const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// Funcion para recuperar la contraseña de un usuario registrado,
// se envia un correo con un enlace para restablecer la contraseña.
const recoverPassword = async (email) => {
    const redirectTo = process.env.SUPABASE_PASSWORD_RECOVERY_REDIRECT_URL || 'http://localhost:5173/reset-password';
    try {
        const { data, error } = await supabaseAnon.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        if (error) {
            // Añadimos contexto al error para facilitar depuración desde el cliente
            const msg = error.message || 'Error al solicitar recuperación de contraseña.'
            throw new Error(msg)
        }

        return data
    } catch (err) {
        // Re-lanzamos el error para que el controlador lo maneje, pero logueamos primero
        console.error('recoverPassword error:', err.message || err)
        throw err
    }
}

// Funcion para actualizar la contraseña de un usuario autenticado o con token de recuperación
const updatePassword = async (token, newPassword) => {
    try {
        let userId = null;
        const tokenStr = String(token || '').trim();

        // Caso 1: token JWT (access_token en URL)
        const parts = tokenStr.split('.');
        if (parts.length >= 2) {
            const payloadStr = Buffer.from(parts[1], 'base64url').toString('utf8');
            const payload = JSON.parse(payloadStr);
            userId = payload?.sub || null;
        }

        // Caso 2: token_hash (enlaces nuevos de Supabase)
        if (!userId) {
            const { data: otpData, error: otpError } = await supabaseAnon.auth.verifyOtp({
                type: 'recovery',
                token_hash: tokenStr,
            });

            if (otpError) {
                throw new Error(otpError.message);
            }

            userId = otpData?.user?.id || otpData?.session?.user?.id || null;
        }

        if (!userId) {
            throw new Error('No se pudo identificar al usuario desde el token.');
        }

        const { data, error } = await supabaseService.auth.admin.updateUserById(userId, {
            password: newPassword,
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (err) {
        console.error('updatePassword error:', err.message || err)
        throw err
    }
}

module.exports = {
    registerUser,
    loginUser,
    recoverPassword,
    updatePassword
};

