const authService = require('../services/auth.service');

// Funcion para registrar un nuevo usuario con metadata adicional
const register = async (req, res) => {
    try {
        const { name, username, email, password, university, career } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
        }

        const metadata = {
            name: name || '',
            username: username || '',
            university: university || '',
            career: career || '',
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

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
        }

        const data = await authService.loginUser(email, password);

        res.status(200).json({
            message: 'Login exitoso',
            data,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const recover = async (req, res) => {
    try {
        const { email } = req.body;

        console.log('Recover password request for email:', email);

        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'Email es requerido.' });
        }

        const trimmedEmail = email.trim().toLowerCase();
        
        if (!trimmedEmail.includes('@')) {
            return res.status(400).json({ error: 'Email no es válido.' });
        }

        await authService.recoverPassword(trimmedEmail);

        res.status(200).json({
            message: 'Correo de recuperación enviado. Revisa tu bandeja de entrada.',
        });
    } catch (error) {
        console.error('Recover password error:', error.message);
        
        // Manejo específico de errores de Supabase
        let errorMessage = error.message;
        
        if (error.message.includes('rate limit')) {
            errorMessage = 'Demasiados intentos. Espera unos minutos antes de intentar de nuevo.';
        } else if (error.message.includes('user_not_found')) {
            errorMessage = 'No encontramos una cuenta con ese email.';
        }
        
        res.status(400).json({ error: errorMessage });
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