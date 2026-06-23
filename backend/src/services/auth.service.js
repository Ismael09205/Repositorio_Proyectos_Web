const { supabaseAnon, supabaseService } = require('../config/supabase');

const registerUser = async (email, password, metadata = {}, isAdmin = false) => {
    
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

    try {
        const userId = data?.user?.id;

        if (isAdmin) {
            // Mapeo exacto según el SQL de 'public.administrators'
            const adminProfile = {
                id: userId,
                name: metadata.nombre_completo || metadata.name || '',
                username: metadata.username || '',
                email: email.trim().toLowerCase(),
                cargo: metadata.cargo || null,
                especialidad: metadata.especialidad || null,
                sector: metadata.sector || null,
                created_at: new Date().toISOString()
            };

            let { data: adminData, error: adminError } = await supabaseService
                .from('administrators')
                .upsert(adminProfile, { onConflict: 'id' })
                .select()
                .single();

            if (adminError && adminError.message?.includes('column "created_at"')) {
                adminProfile.createt_at = adminProfile.created_at;
                delete adminProfile.created_at;

                const retry = await supabaseService
                    .from('administrators')
                    .upsert(adminProfile, { onConflict: 'id' })
                    .select()
                    .single();

                adminData = retry.data;
                adminError = retry.error;
            }

            if (adminError) throw adminError;

            return { auth: data, profile: adminData };

        } else {

            const studentProfile = {
                id: userId,
                nombre_completo: metadata.nombre_completo || metadata.name || '',
                universidad: metadata.university || metadata.universidad || 'Escuela Politécnica Nacional',
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

            let { data: profileData, error: profileError } = await supabaseService
                .from('profiles')
                .upsert(studentProfile, { onConflict: 'id' })
                .select()
                .single();

            if (profileError && profileError.message?.includes('column "created_at"')) {
                studentProfile.createt_at = studentProfile.created_at;
                delete studentProfile.created_at;

                const retry = await supabaseService
                    .from('profiles')
                    .upsert(studentProfile, { onConflict: 'id' })
                    .select()
                    .single();

                profileData = retry.data;
                profileError = retry.error;
            }

            if (profileError) throw profileError;

            return { auth: data, profile: profileData };
        }
    } catch (err) {

        console.error('Error crítico en post-registro insertando en la Base de Datos:', err.message || err);
        throw new Error(`Error en la persistencia de datos: ${err.message}`);
    }
}

const loginUser = async (email, password) => {
    const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

const recoverPassword = async (email) => {
    const redirectTo = process.env.SUPABASE_PASSWORD_RECOVERY_REDIRECT_URL || 'http://localhost:5173/reset-password';
    try {
        const { data, error } = await supabaseAnon.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        if (error) {
            const msg = error.message || 'Error al solicitar recuperación de contraseña.'
            throw new Error(msg)
        }

        return data
    } catch (err) {
        console.error('recoverPassword error:', err.message || err)
        throw err
    }
}

const updatePassword = async (token, newPassword) => {
    try {
        let userId = null;
        const tokenStr = String(token || '').trim();

        const parts = tokenStr.split('.');
        if (parts.length >= 2) {
            const payloadStr = Buffer.from(parts[1], 'base64url').toString('utf8');
            const payload = JSON.parse(payloadStr);
            userId = payload?.sub || null;
        }

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