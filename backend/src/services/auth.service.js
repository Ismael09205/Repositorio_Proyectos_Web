const { supabaseAnon, supabaseService } = require('../config/supabase');


// Funcion para registrar un nuevo usuario donde se recibe el email, password y metadata
const registerUser = async (email, password, metadata = {}) => {
    // 1) Registramos el usuario en Auth y guardamos la respuesta
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

    // 2) Intentamos crear explícitamente el perfil en la tabla `profiles`
    // Usamos el client con service role para poder escribir en la tabla
    try {
        const userId = data?.user?.id;

        // Construimos el objeto de perfil con los campos esperados
        const profile = {
            id: userId,
            nombre_completo: metadata.nombre_completo || metadata.name || '',
            universidad: metadata.university || metadata.universidad || '',
            facultad: metadata.facultad || '',
            carrera: metadata.career || metadata.carrera || '',
            semestre: metadata.semestre || null,
            biografia: metadata.biografia || '',
            ciudad: metadata.ciudad || '',
            intereses: metadata.intereses || null,
            github_url: metadata.github_url || '',
            linkedin_url: metadata.linkedin_url || '',
            created_at: new Date().toISOString()
        };

        const { data: profileData, error: profileError } = await supabaseService
            .from('profiles')
            .insert(profile)
            .select()
            .single();

        if (profileError) {
            // No hacemos que el fallo del insert rompa el registro en Auth,
            // pero sí informamos para depuración
            console.error('Error creando perfil en DB:', profileError.message || profileError);
        }

        // Devolvemos tanto la respuesta de Auth como el perfil creado (si existe)
        return { auth: data, profile: profileData };
    } catch (err) {
        console.error('Error en post-registro al crear perfil:', err.message || err);
        // Aunque haya fallo en la creación del perfil, devolvemos la respuesta de auth
        return { auth: data };
    }
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
        // Para actualizar la contraseña con un token de recuperación, pasamos el token
        // como `accessToken` en las opciones (supabase-js v2).
        const { data, error } = await supabaseAnon.auth.updateUser(
            { password: newPassword },
            { accessToken: token }
        );

        if (error) {
            throw new Error(error.message)
        }

        return data
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

