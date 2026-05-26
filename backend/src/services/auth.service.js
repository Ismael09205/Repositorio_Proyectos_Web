const { supabaseAnon } = require('../config/supabase');

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

    const { data, error } = await supabaseAnon.auth.resetPasswordForEmail(email, {
        redirectTo,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// Funcion para actualizar la contraseña de un usuario autenticado o con token de recuperacion.
// Primero se establece la sesion con el token de recuperacion, luego se actualiza la contraseña.
const updatePassword = async (token, newPassword) => {
    const { data: sessionData, error: sessionError } = await supabaseAnon.auth.setSession({
        access_token: token,
        refresh_token: token,
    });

    if (sessionError) {
        throw new Error(sessionError.message);
    }

    const { data, error } = await supabaseAnon.auth.updateUser({
        password: newPassword,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

module.exports = {
    registerUser,
    loginUser,
    recoverPassword,
    updatePassword
};