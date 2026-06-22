/**
 * Traduce mensajes de error técnicos a mensajes amigables para el usuario final
 * @param {string} error - Mensaje de error técnico
 * @returns {string} Mensaje amigable para el usuario
 */
export const translateError = (error) => {
  if (!error) return 'Algo salió mal. Intenta de nuevo.'

  const errorStr = error.toLowerCase()

  // Errores de Supabase
  if (errorStr.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.'
  }
  if (errorStr.includes('user already registered')) {
    return 'Este correo ya está registrado. Intenta iniciar sesión.'
  }
  if (errorStr.includes('email rate limit')) {
    return 'Demasiados intentos. Espera unos minutos antes de intentar de nuevo.'
  }
  if (errorStr.includes('rate limit')) {
    return 'Muchos intentos. Intenta más tarde.'
  }
  if (errorStr.includes('user_not_found') || errorStr.includes('user not found')) {
    return 'No encontramos una cuenta con ese correo.'
  }
  if (errorStr.includes('invalid password') || errorStr.includes('password')) {
    return 'Contraseña inválida o muy corta (mínimo 6 caracteres).'
  }
  if (errorStr.includes('invalid email')) {
    return 'Correo inválido.'
  }
  if (errorStr.includes('network')) {
    return 'Problema de conexión. Verifica tu internet e intenta de nuevo.'
  }
  if (errorStr.includes('timeout')) {
    return 'La solicitud tardó demasiado. Intenta de nuevo.'
  }

  // Errores locales
  if (error === 'Completa todos los campos.') {
    return error
  }
  if (error.includes('caracteres')) {
    return error
  }
  if (error.includes('coinciden')) {
    return error
  }
  if (error.includes('correo')) {
    return error
  }
  if (error.includes('token')) {
    return 'El enlace de recuperación expiró o es inválido. Solicita uno nuevo.'
  }

  // Si no coincide con nada, devuelve el error original pero genérico
  return 'Algo salió mal. Intenta de nuevo más tarde.'
}
