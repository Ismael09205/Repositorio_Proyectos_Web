const supabase = require('../config/supabase');

// MIddleawre para verificar si el usuario esta autenticado o no, se verifica el token de 
// autenticacion que se envia en el header de la peticion

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader){
            return res.status(401).json({error: "No hay un token de autenticacion"});
        }

        const token = authHeader.split(" ")[1];

        const {data, error} = await supabase.auth.getUser(token);

        if(error){
            return res.status(401).json({error: "El Token de autenticacion invalido"});
        }

        req.user = data.user;
        next();
    }catch (error) {
        res.status(500).json({error: error.message});
    }
}

module.exports = authMiddleware;
