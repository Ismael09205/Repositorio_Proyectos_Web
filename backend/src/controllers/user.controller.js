
//Funcion para obtener el perfil del usario autenticado, 
// se asume que el midleware de autenticacion ya ha verificado 
// el token y ha agregado la informacion del usuario al objeto de la peticion (req.user)
const getProfile = async (req, res) => {
    try {
        res.status(200).json({
            user: req.user
        });
    }catch (error) {
        res.status(500).json({error: error.message});
    }
}

module.exports = {
    getProfile
};