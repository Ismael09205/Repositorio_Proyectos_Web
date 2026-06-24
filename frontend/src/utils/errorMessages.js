/**
 * Traduce mensajes de error técnicos a mensajes amigables para el usuario final
 * @param {string} error - Mensaje de error técnico
 * @returns {string} Mensaje amigable para el usuario
 */
export const translateError = (error) => {
  if (!error) return 'Algo salió mal. Intenta de nuevo.'

  const errorStr = String(error).toLowerCase()

  // Errores de Supabase y backend
  if (errorStr.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.'
  }
  if (errorStr.includes('user already registered') || (errorStr.includes('duplicate key value') && errorStr.includes('email'))) {
    return 'Este correo ya está registrado. Intenta iniciar sesión o recupera tu contraseña.'
  }
  if (errorStr.includes('duplicate key value') && errorStr.includes('nombre_usuario')) {
    return 'El nombre de usuario ya está en uso. Elige otro nombre de usuario.'
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
  if (errorStr.includes('invalid password')) {
    return 'Contraseña inválida o muy corta (mínimo 6 caracteres).'
  }
  if (errorStr.includes('invalid email') || errorStr.includes('email inválido') || errorStr.includes('invalid email address')) {
    return 'El correo electrónico no tiene un formato válido.'
  }
  if (errorStr.includes('bad_email_domain') || errorStr.includes('dominio institucional') || errorStr.includes('dominio del correo')) {
    return 'Usa tu correo institucional de la universidad.'
  }
  if (errorStr.includes('database error saving new user') || errorStr.includes('database error creating new user')) {
    return 'No se pudo crear la cuenta. Revisa el correo institucional y el nombre de usuario.'
  }
  if (errorStr.includes('nombre de usuario') && (errorStr.includes('requerido') || errorStr.includes('es requerido'))) {
    return 'Ingresa un nombre de usuario.'
  }
  if (errorStr.includes('nombre completo') && errorStr.includes('requerido')) {
    return 'Ingresa tu nombre completo.'
  }
  if (errorStr.includes('token') && (errorStr.includes('invalid') || errorStr.includes('expir'))) {
    return 'El enlace o token es inválido o expiró. Solicita uno nuevo.'
  }
  if (errorStr.includes('user not found') || errorStr.includes('usuario no encontrado')) {
    return 'No encontramos una cuenta con ese correo institucional.'
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

  // Mensajes ya amigables en español
  const spanishKeywords = ['correo', 'contraseña', 'usuario', 'dominio', 'institucional', 'recuper', 'registro', 'sesión', 'token', 'confirm', 'verificar']
  if (spanishKeywords.some(keyword => errorStr.includes(keyword))) {
    return String(error)
  }

  return 'Algo salió mal. Intenta de nuevo más tarde.'
}
