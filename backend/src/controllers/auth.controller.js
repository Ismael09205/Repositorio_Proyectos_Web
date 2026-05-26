const authService = require('../services/auth.service');

//Funcion para registrar un nuevo usuario donde se recibe el email y password, y devolvera 
//un mensaje de exito o error en formato json dependiendo del resultado de la operacion
const register = async (req, res) => {
    try {
        console.log(req.body);
        const {email, password} = req.body;
        const data = await authService.registerUser(email, password);

        res.status(201).json({
        message: "usuario registrado correctamente",
        data
        });

}catch (error) {
        res.status(400).json({error: error.message});
    }
}

const login = async (req, res) => {
    try{
        const {email, password} = req.body;
        const data = await authService.loginUser(email, password);

        res.status(200).json({
            message: "login exitoso",
            data
        })
    }catch (error){
        res.status(400).json({error: error.message});
    }
}

const recover = async (req, res) => {
    try {
        const {email} = req.body;
        await authService.recoverPassword(email);

        res.status(200).json({
            message: "Correo de recuperación enviada"
        });
    }catch (error) {
        res.status(400).json({error: error.message});
    }
}

const changePassword = async (req, res) => {
    try {
        const {password} = req.body;
        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];

        const data = await authService.updatePassword(token, password);

        res.status(200).json({
            message: "Contraseña actualizada correctamente",
            data
        });
    }catch (error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    register,
    login,
    recover,
    changePassword
};


