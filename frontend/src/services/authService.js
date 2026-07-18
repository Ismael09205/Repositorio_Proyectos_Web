import axios from 'axios'
import API_BASE_URL from './apiConfig.js'

const AUTH_URL = `${API_BASE_URL}/api/auth`
const USER_URL = `${API_BASE_URL}/api/users`

/**
 * Registra un nuevo estudiante en la plataforma PoliConnect.
 */
export const registerUser = async (userData) => {
  const response = await axios.post(`${AUTH_URL}/register`, {
    nombre_completo: userData.name || userData.nombre_completo,
    nombre_usuario: userData.username || userData.nombre_usuario,
    email: userData.email,
    password: userData.password,
    universidad: userData.university || userData.universidad,
    carrera: userData.career || userData.carrera,
    semestre: userData.semestre,
  })
  return response.data
}

/**
 * Inicia sesión validando credenciales y el estado de verificación de correo institucional.
 */
export const loginUser = async (email, password) => {
  const response = await axios.post(`${AUTH_URL}/login`, {
    email,
    password,
  })

  return response.data
}

export const registerAdmin = async (userData) => {
  const response = await axios.post(`${AUTH_URL}/register-admin`, {
    name: userData.name,
    username: userData.username,
    email: userData.email,
    password: userData.password,
  })

  return response.data
}

/**
 * Solicita el enlace de recuperación de contraseña a Supabase a través del servidor Express.
 */
export const recoverPassword = async (email) => {
  const response = await axios.post(`${AUTH_URL}/recover`, { email })
  return response.data
}

/**
 * Actualiza la contraseña del usuario utilizando el token de recuperación recibido por correo.
 */
export const changePassword = async (token, password) => {
  const response = await axios.post(
    `${AUTH_URL}/change-password`,
    { password, token },
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    }
  )

  return response.data
}

/**
 * Obtiene los datos extendidos de la ficha del estudiante desde la tabla de perfiles.
 */
export const fetchProfile = async (token) => {
  const response = await axios.get(`${USER_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

/**
 * Actualiza los datos del perfil del usuario logueado (Estudiante o Administrador).
 * Sirve tanto para editar datos generales como para actualizar el avatar_url
 * una vez que la imagen ya fue subida a Cloudinary desde el frontend.
 */
export const updateProfile = async (token, profileData) => {
  const response = await axios.put(`${USER_URL}/profile`, profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}