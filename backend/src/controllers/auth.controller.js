const authService = require('../services/auth.service');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getFriendlyError = (error) => {
    const message = String(error?.message || error || '').trim();
    const normalized = message.toLowerCase();

    if (!normalized) {
        return 'Ocurrió un error inesperado. Intenta de nuevo más tarde.';
    }

    if (normalized.includes('invalid login credentials')) {
        return 'El correo o la contraseña son incorrectos.';
    }
    if (normalized.includes('user already registered') || (normalized.includes('duplicate key value') && normalized.includes('email'))) {
        return 'Este correo ya está registrado. Intenta iniciar sesión o recupera tu contraseña.';
    }
    if (normalized.includes('duplicate key value') && normalized.includes('nombre_usuario')) {
        return 'El nombre de usuario ya está en uso. Elige otro nombre de usuario.';
    }
    if (normalized.includes('null value in column "nombre_usuario"')) {
        return 'Hace falta un nombre de usuario. Completa el campo nombre de usuario y vuelve a intentarlo.';
    }
    if (normalized.includes('database error saving new user') || normalized.includes('database error creating new user')) {
        return 'No se pudo crear la cuenta. Intenta de nuevo o usa un correo diferente.';
    }
    if (normalized.includes('invalid email') || normalized.includes('email inválido') || normalized.includes('invalid email address')) {
        return 'El correo electrónico no tiene un formato válido.';
    }
    if (normalized.includes('bad_email_domain')) {
        return 'El correo proporcionado no tiene un formato válido. Usa un correo válido.';
    }
    if (normalized.includes('rate limit')) {
        return 'Demasiados intentos. Espera unos minutos antes de intentarlo de nuevo.';
    }
    if (normalized.includes('network')) {
        return 'Hay un problema de conexión. Verifica tu internet e intenta de nuevo.';
    }
    if (normalized.includes('timeout')) {
        return 'La solicitud tardó demasiado. Intenta de nuevo más tarde.';
    }
    if (normalized.includes('token') && (normalized.includes('invalid') || normalized.includes('expir'))) {
        return 'El enlace o token es inválido o expiró. Solicita uno nuevo.';
    }
    if (normalized.includes('user not found') || normalized.includes('user_not_found')) {
        return 'No encontramos una cuenta con ese correo. Registrate o verifica el correo ingresado.';
    }
    if (normalized.includes('password') && normalized.includes('invalid')) {
        return 'Contraseña inválida o muy corta (mínimo 6 caracteres).';
    }
    if (normalized.includes('no se pudo identificar al usuario desde el token')) {
        return 'El enlace de recuperación no se pudo procesar. Solicita uno nuevo.';
    }
    if (normalized.includes('nombre completo es requerido')) {
        return 'Ingresa tu nombre completo.';
    }
    if (normalized.includes('nombre de usuario es requerido')) {
        return 'Ingresa un nombre de usuario.';
    }
    return 'Ocurrió un error inesperado. Intenta de nuevo más tarde.';
};

const buildErrorResponse = (error) => {
    const raw = String(error?.message || error || '').trim();
    const friendly = getFriendlyError(error);
    return {
        error: friendly,
        internal: raw || 'Error interno. Revisa el backend para más detalles.',
    };
};

// Función para registrar un nuevo usuario con metadata adicional
const register = async (req, res) => {
    try {

        const { name, nombre_completo, username, nombre_usuario, email, password, university, universidad, career, carrera, facultad, semestre, biografia, ciudad, intereses, github_url, linkedin_url } = req.body;

        const resolvedName = name || nombre_completo;
        const resolvedUsername = username || nombre_usuario;
        const resolvedUniversity = university || universidad;
        const resolvedCareer = career || carrera;

        if (!resolvedName || !resolvedName.trim()) {
            return res.status(400).json({ error: 'Nombre completo es requerido.' });
        }
        if (!resolvedUsername || !resolvedUsername.trim()) {
            return res.status(400).json({ error: 'Nombre de usuario es requerido.' });
        }
        if (!email || !email.trim() || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
        }
        if (!emailPattern.test(String(email).trim().toLowerCase())) {
            return res.status(400).json({ error: 'El correo electrónico no tiene un formato válido.' });
        }
        if (String(password).length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
        }

        const metadata = {
            nombre_completo: resolvedName || '', 
            nombre_usuario: resolvedUsername || '',
            universidad: resolvedUniversity,
            carrera: resolvedCareer || '',
            facultad: facultad || '',
            semestre: semestre || null,
            biografia: biografia || '',
            ciudad: ciudad || '',
            intereses: intereses || null,
            github_url: github_url || '',
            linkedin_url: linkedin_url || ''
        };

        // Enviamos la metadata real a Supabase Auth a través del servicio
        const data = await authService.registerUser(email, password, metadata);

        return res.status(201).json({
            message: 'Usuario registrado correctamente',
            user: data.auth?.user ?? null,
            session: data.auth?.session ?? null,
            profile: data.profile ?? null,
        });
    } catch (error) {
        const payload = buildErrorResponse(error);
        console.error('Register error:', error);
        return res.status(400).json(payload);
    }
}

const registerAdmin = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !name.trim()) return res.status(400).json({ error: 'Nombre completo es requerido.' });
        if (!username || !username.trim()) return res.status(400).json({ error: 'Nombre de usuario es requerido.' });
        if (!email || !email.trim() || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
        if (String(password).length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });

        const lowerEmail = email.trim().toLowerCase();
        const isEpnEmail = lowerEmail.endsWith('@epn.edu.ec');
        const isAdminPattern = lowerEmail.includes('admin') || lowerEmail.includes('area') || lowerEmail.includes('gestion');
        const isValidAdminEmail = isEpnEmail && isAdminPattern;

        if (!isValidAdminEmail) {
            return res.status(403).json({ error: 'El correo electrónico administrativo debe ser institucional de la EPN y corresponder a una cuenta de gestión autorizada.' });
        }

        const metadata = {
            nombre_completo: name.trim(),
            nombre_usuario: username.trim(),
            role: 'admin'
        };

        const data = await authService.registerUser(email, password, metadata, true);

        try {
            if (typeof authLogsService !== 'undefined') {
                await authLogsService.createLog(
                    data.auth?.user?.id,
                    'register_admin',
                    email,
                    req.ip || req.connection?.remoteAddress,
                    req.get('user-agent')
                );
            }
        } catch (logError) {
            console.error('Error al registrar log de administrador:', logError);
        }

        return res.status(201).json({
            message: 'Administrador registrado correctamente en el sistema.',
            user: data.auth?.user ?? null,
            session: data.auth?.session ?? null,
            profile: data.profile ?? null,
        });
    } catch (error) {
        console.error("Error en registro de administrador:", error.message);
        return res.status(400).json({ error: error.message });
    }
};

// Función de login corregida para aplanar la respuesta de Supabase
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
        }

        // 1. Intentamos hacer el login en el servicio de Supabase
        const authData = await authService.loginUser(email, password);

        // 2. EL CANDADO: Revisamos si el correo del usuario ya fue confirmado por Supabase
        // Supabase guarda esto en authData.user.email_confirmed_at. Si es NULL, no está verificado.
        if (!authData.user || !authData.user.email_confirmed_at) {
            return res.status(401).json({ 
                error: 'Por favor, verifica tu correo electrónico antes de iniciar sesión.' 
            });
        }

        // 3. Si está confirmado, pasa limpio y le entregamos el token
        res.status(200).json({
            message: 'Login exitoso',
            token: authData.session?.access_token || authData.token, 
            user: authData.user
        });

        await authLogsService.createLog(
            authData.user?.id,
            'login',
            email,
            req.ip || req.connection?.remoteAddress,
            req.get('user-agent')
        );
    } catch (error) {
        const payload = buildErrorResponse(error);
        console.error('Login error:', error);
        return res.status(400).json(payload);
    }
}
const recover = async (req, res) => {
    try {
        const { email } = req.body;

        console.log('Recover password request for email:', email);

        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'El correo electrónico es requerido.' });
        }

        const trimmedEmail = email.trim().toLowerCase();
        
        if (!trimmedEmail.includes('@')) {
            return res.status(400).json({ error: 'El correo electrónico no es válido.' });
        }

        // Ejecuta la petición hacia el servicio de Supabase
        await authService.recoverPassword(trimmedEmail);

        return res.status(200).json({
            message: 'Correo de recuperación enviado. Revisa tu bandeja de entrada.',
        });
    } catch (error) {
        const payload = buildErrorResponse(error);
        console.error('Recover password error:', error);
        return res.status(400).json(payload);
    }
}

const changePassword = async (req, res) => {
    try {
        // 1. Capturamos el password y el token que envía Axios en el cuerpo (body) desde React
        const { password, token: bodyToken } = req.body;
        const authHeader = req.headers.authorization;
        
        // 2. Extraemos el token del header Bearer si existe
        let token = authHeader ? authHeader.split(' ')[1] : null;
        
        // 3. Priorizamos el token: usamos el del header o el que viene en el cuerpo
        const finalToken = token || bodyToken;

        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
        }

        if (!finalToken) {
            return res.status(401).json({ error: 'Token de recuperación requerido o expirado.' });
        }

        // SOLUCIÓN AQUÍ: Pasamos los parámetros en el orden exacto que espera tu auth.service.js:
        // Primero el token para montar la sesión de Supabase, luego la nueva contraseña.
        const data = await authService.updatePassword(finalToken.trim(), password);

        return res.status(200).json({
            message: 'Contraseña actualizada correctamente',
            data,
        });
    } catch (error) {
        const payload = buildErrorResponse(error);
        console.error('Change password error:', error);
        return res.status(400).json(payload);
    }
}

module.exports = {
    register,
    registerAdmin,
    login,
    recover,
    changePassword,
};


