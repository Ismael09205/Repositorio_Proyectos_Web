const authService = require('../services/auth.service');

// Función para registrar un nuevo usuario con metadata adicional
const register = async (req, res) => {
    try {
        const { name, username, email, password, university, career, facultad, semestre, biografia, ciudad, intereses, github_url, linkedin_url } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
        }

        const metadata = {
            nombre_completo: name || '', // Sincronizado con el trigger de tu tabla 'profiles'
            username: username || '',
            university: university || 'Escuela Politécnica Nacional',
            career: career || '',
            facultad: facultad || '',
            semestre: semestre || null,
            biografia: biografia || '',
            ciudad: ciudad || '',
            intereses: intereses || null,
            github_url: github_url || '',
            linkedin_url: linkedin_url || ''
        };

        const data = await authService.registerUser(email, password, metadata);

        res.status(201).json({
            message: 'Usuario registrado correctamente',
            data,
        });
    } catch (error) {
        
        res.status(400).json({ error: error.message });
    }
}

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
                error: 'Por favor, verifica tu correo institucional de la EPN antes de iniciar sesión.' 
            });
        }

        // 3. Si está confirmado, pasa limpio y le entregamos el token
        res.status(200).json({
            message: 'Login exitoso',
            token: authData.session?.access_token || authData.token, 
            user: authData.user
        });
    } catch (error) {
        console.error("Error en login controlador:", error.message);
        let clientError = error.message;
        if (error.message.includes('Invalid login credentials')) {
            clientError = 'El correo electrónico o la contraseña son incorrectos.';
        }
        res.status(400).json({ error: clientError });
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
        console.error('Error detallado en el controlador de recuperación:', error.message);
        
        let errorMessage = error.message;
        
        // Evaluamos el mensaje real que retorna el SDK de Supabase
        if (error.message.includes('rate limit') || error.message.includes('security purposes')) {
            errorMessage = 'Demasiados intentos. Por seguridad, espera unos minutos antes de intentar de nuevo.';
        } else if (error.message.includes('User not found') || error.message.includes('user_not_found') || error.message.includes('user not found')) {
            errorMessage = 'No encontramos ninguna cuenta registrada con este correo institucional.';
        } else if (error.message.includes('bad_email_domain')) {
            errorMessage = 'El dominio de este correo electrónico no está permitido.';
        }
        
        return res.status(400).json({ error: errorMessage });
    }
}

const changePassword = async (req, res) => {
    try {
        const { password, token: bodyToken } = req.body;
        const authHeader = req.headers.authorization;
        let token = authHeader ? authHeader.split(' ')[1] : null;
        token = token || bodyToken;

        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
        }

        if (!token) {
            return res.status(401).json({ error: 'Token de recuperación requerido.' });
        }

        const data = await authService.updatePassword(token, password);

        res.status(200).json({
            message: 'Contraseña actualizada correctamente',
            data,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    register,
    login,
    recover,
    changePassword,
};


