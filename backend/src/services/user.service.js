const { supabaseService } = require('../config/supabase');

async function getProfileById(userId) {
  // Try to get from profiles table first (students)
  const { data: profileData, error: profileError } = await supabaseService
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileData) {
    return profileData;
  }

  // If not found in profiles, try administrators table
  const { data: adminData, error: adminError } = await supabaseService
    .from('administrators')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (adminData) {
    return adminData;
  }

  // If not found in either table
  if (profileError || adminError) {
    throw new Error('El perfil no existe en el sistema.');
  }

  throw new Error('El perfil no existe en el sistema.');
}

async function updateProfileById(userId, profileData) {
  // 1. Check if user is admin or student
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
    };

    const { data, error } = await supabaseService
      .from('administrators')
      .update(payload)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } else {
    // Update student profile
    const currentProfile = await getProfileById(userId);

    // Process interests if provided
    let intereses = currentProfile.intereses;
    if (profileData?.intereses !== undefined) {
      intereses = Array.isArray(profileData.intereses)
        ? profileData.intereses
        : typeof profileData.intereses === 'string'
          ? profileData.intereses.split(',').map(t => t.trim()).filter(Boolean)
          : [];
    }

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
    };

    const { data, error } = await supabaseService
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = {
  getProfileById,
  updateProfileById
};