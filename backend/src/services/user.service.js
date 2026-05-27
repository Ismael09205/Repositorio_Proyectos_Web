const { supabaseAnon } = require('../config/supabase');

/**
 * Obtener el perfil extendido de la tabla 'profiles' usando el UUID del usuario
 */
async function getProfileById(userId) {
  const { data, error } = await supabaseAnon
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualizar los datos modificados por el estudiante en PoliConnect
 */
// Actualizar los datos modificados por el estudiante en PoliConnect
async function updateProfileById(userId, profileData) {
  const { data, error } = await supabaseAnon
    .from('profiles')
    .update({
      nombre_completo: profileData.nombre_completo,
      facultad: profileData.facultad,
      carrera: profileData.carrera,
      semestre: profileData.semestre,
      biografia: profileData.biografia,
      ciudad: profileData.ciudad,
      intereses: profileData.intereses,
      github_url: profileData.github_url,
      linkedin_url: profileData.linkedin_url
    })
    .eq('id', userId)
    .select('*'); // 1. Quitamos .single() de aquí para evitar el error de coerción

  if (error) throw error;

  // 2. Si la base de datos devolvió un arreglo con la fila modificada, extraemos el primer elemento
  if (data && data.length > 0) {
    return data[0];
  }

  // Si por alguna razón devolvió vacío, retornamos un objeto base con lo que envió el cliente
  return { id: userId, ...profileData };
}

// Exportamos los métodos de forma limpia para que los consuma el controlador
module.exports = {
  getProfileById,
  updateProfileById
};