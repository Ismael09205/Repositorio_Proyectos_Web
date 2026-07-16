const { supabaseService } = require('../config/supabase');

async function getProfileById(userId) {
  // 1. Buscamos primero en perfiles de estudiantes
  const { data: studentData, error: studentError } = await supabaseService
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (studentError) throw studentError;
  if (studentData) {
    return studentData; // Ya incluye el campo 'rol': 'estudiante' nativo de la BD
  }

  // 2. Si no es estudiante, buscamos en administradores
  const { data: adminData, error: adminError } = await supabaseService
    .from('administrators')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (adminError) throw adminError;
  if (adminData) {
    return adminData; // Ya incluye el campo 'rol': 'administrador' nativo de la BD
  }

  // 3. Si no existe en ninguna de las dos tablas
  throw new Error('El perfil no existe en el sistema.');
}

async function updateProfileById(userId, profileData) {

  //Check if user is admin or student
  const { data: adminCheck } = await supabaseService
    .from('administrators')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  const isAdmin = !!adminCheck;

    if (isAdmin) {
    // Update administrator profile
    const currentProfile = await getProfileById(userId);

    const payload = {
      id: userId,
      name: profileData?.name ?? currentProfile.name,
      username: profileData?.username ?? currentProfile.username,
      cargo: profileData?.cargo ?? currentProfile.cargo,
      especialidad: profileData?.especialidad ?? currentProfile.especialidad,
      sector: profileData?.sector ?? currentProfile.sector,
      avatar_url: profileData?.avatar_url ?? currentProfile.avatar_url,
    };

    const { data, error } = await supabaseService
      .from('administrators')
      .update(payload)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
    
  }else {

  // 1. Traemos el perfil actual para no perder los datos que no se envíen en el body
  const currentProfile = await getProfileById(userId);

  // 2. Procesamos los intereses si es que vienen en la petición
  let intereses = currentProfile.intereses; 
  if (profileData?.intereses !== undefined) {
    intereses = Array.isArray(profileData.intereses)
      ? profileData.intereses
      : typeof profileData.intereses === 'string'
        ? profileData.intereses.split(',').map(t => t.trim()).filter(Boolean)
        : [];
  }

  // 3. Fusionamos los datos viejos con los nuevos de forma segura
  const payload = {
    id: userId,
    nombre_completo: profileData?.nombre_completo ?? currentProfile.nombre_completo,
    universidad: profileData?.universidad ?? profileData?.university ?? currentProfile.universidad,
    facultad: profileData?.facultad ?? currentProfile.facultad,
    carrera: profileData?.carrera ?? profileData?.career ?? currentProfile.carrera,
    semestre: profileData?.semestre ?? currentProfile.semestre,
    biografia: profileData?.biografia ?? currentProfile.biografia,
    ciudad: profileData?.ciudad ?? currentProfile.ciudad,
    intereses: intereses,
    github_url: profileData?.github_url ?? currentProfile.github_url,
    linkedin_url: profileData?.linkedin_url ?? currentProfile.linkedin_url,
    avatar_url: profileData?.avatar_url ?? currentProfile.avatar_url,
  };

  // 4. Guardamos los cambios
  const { data, error } = await supabaseService
    .from('profiles')
    .update(payload) // Usamos update en vez de upsert ya que el registro existe sí o sí
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
  }
};

module.exports = {
  getProfileById,
  updateProfileById
};