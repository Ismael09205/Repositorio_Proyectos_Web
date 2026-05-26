const supabase = require('../config/supabase');

//Funcion para registrar un nuevo usuario donde se recibe el email y password
const registerUser = async (email, password) => {

    const {data, error} = await supabase.auth.signUp({email,password})

    if (error){
        throw new Error(error.message);
    }
    
    return data;
}

//Funcion para iniciar sesion de un usuario que ya esta previamente registrado
const loginUser = async(email, password) => {

    const {data, error} = await supabase.auth.signInWithPassword({email,password})

    if(error){
        throw new Error(error.message);
    }

    return data;
}


//Funcion para recuperar la contraseña de un usuario registrado, 
// se envia un correo con un enlace para restablecer la contraseña
const recoverPassword = async (email) => {
    
    const {data, error} = await supabase.auth.resetPasswordForEmail(email, {

    });

    if(error){
        throw new Error(error.message);
    }

    return data;
}

//Funcion para actualizar la contraseña de un usuario autenticado, se recibe el token de autenticacion
//  y la nueva contraseña,
const updatePassword = async (token, newPassword) => {

    const {data, error} = await supabase.auth.updateUser(
        {password: newPassword},
        {accessToken: token}
    );

    if(error){
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

