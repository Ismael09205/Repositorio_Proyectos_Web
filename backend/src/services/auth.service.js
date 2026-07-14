const { supabaseAnon, supabaseService } = require('../config/supabase');


// Funcion para registrar un nuevo usuario donde se recibe el email, password y metadata
const registerUser = async (email, password, metadata = {}, isAdmin = false) => {
    const normalizedMetadata = {
        nombre_completo: String(metadata.nombre_completo || '').trim(),
        username: String(metadata.nombre_usuario || metadata.username || '').trim(),
        universidad: String(metadata.universidad || '').trim(),
        facultad: String(metadata.facultad || '').trim(),
        carrera: String(metadata.carrera || '').trim(),
        semestre: metadata.semestre ?? null,
        biografia: String(metadata.biografia || '').trim(),
        ciudad: String(metadata.ciudad || '').trim(),
        intereses: metadata.intereses ?? null,
        github_url: String(metadata.github_url || '').trim(),
        linkedin_url: String(metadata.linkedin_url || '').trim(),
    };

    if (!normalizedMetadata.nombre_completo) {
        throw new Error('El nombre completo es requerido para el registro.');
    }
    if (!normalizedMetadata.username) {
        throw new Error('El nombre de usuario es requerido para el registro.');
    }

    normalizedMetadata.role = isAdmin ? 'admin' : 'student';
    
    // 1) Registramos el usuario en Auth y guardamos la respuesta
    const { data, error } = await supabaseAnon.auth.signUp({
        email,
        password,
        options: {
            data: normalizedMetadata,
        },
    });

    if (error) {
        const authError = new Error(error.message);
        authError.code = error.code;
        authError.status = error.status;
        throw authError;
    }


    // 2) Intentamos crear explícitamente el perfil en la tabla `profiles`
    // Usamos el client con service role para poder escribir en la tabla
    try {
        const userId = data?.user?.id;

        if (isAdmin) {
            // Mapeo exacto según el SQL de 'public.administrators'
            const adminProfile = {
                id: userId,
                name: metadata.nombre_completo || metadata.name || '',
                username: metadata.username || metadata.nombre_usuario || '', 
                email: email.trim().toLowerCase(),
                cargo: metadata.cargo || null,
                especialidad: metadata.especialidad || null,
                sector: metadata.sector || null,
                created_at: new Date().toISOString()
            };

            try {
                const { data: adminData, error: adminError } = await supabaseService
                    .from('administrators')
                    .upsert(adminProfile, { onConflict: 'id' })
                    .select()
                    .maybeSingle();

                if (adminError) throw adminError;
                return { auth: data, profile: adminData };
            } catch (dbError) {
                // Si salta por la FK (correo no verificado), ignoramos el crash y dejamos que el trigger actúe después
                console.log('Perfil de administrador pendiente de confirmación de correo.');
                return { auth: data, profile: null, status: 'awaiting_confirmation' };
            }

        } else {

            const profile = {
            id: userId,
            ...normalizedMetadata,
            created_at: new Date().toISOString(),
        };
            const { data: profileData, error: profileError } = await supabaseService
                .from('profiles')
                .upsert(profile, { onConflict: 'id' })
                .select()
                .single();

            if (profileError) throw profileError;
            return { auth: data, profile: profileData };
        }


    } catch (dbError) {
        // Evita el crash si la base de datos rechaza la inserción antes de verificar el correo
        console.log('Perfil de estudiante pendiente de confirmación de correo.');
        return { auth: data, profile: null, status: 'awaiting_confirmation' };
    }
};
   
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

