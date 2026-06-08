const { supabaseService } = require('../config/supabase');


async function getProfileById(userId, userMetadata = {}) {
  const { data, error } = await supabaseService
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;


  if (!data) {
    const initialProfile = {
      id: userId,
      nombre_completo: userMetadata?.nombre_completo || '',
      universidad: userMetadata?.university || userMetadata?.universidad || '',
      carrera: userMetadata?.career || userMetadata?.carrera || '',
      facultad: userMetadata?.facultad || '',
      semestre: userMetadata?.semestre || '',
      biografia: userMetadata?.biografia || '',
      ciudad: userMetadata?.ciudad || '',
      intereses: [],
      github_url: userMetadata?.github_url || '',
      linkedin_url: userMetadata?.linkedin_url || '',
    };

    const { data: upsertData, error: upsertError } = await supabaseService
      .from('profiles')
      .upsert(initialProfile, { onConflict: 'id' })
      .select('*');

    if (upsertError) throw upsertError;

    return upsertData?.[0] ?? initialProfile;
  }

  return data;
}

async function updateProfileById(userId, profileData) {
  const intereses = Array.isArray(profileData?.intereses)
    ? profileData.intereses
    : typeof profileData?.intereses === 'string'
      ? profileData.intereses
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
      : [];


  const universidad = profileData?.universidad ?? profileData?.university ?? '';
  const carrera = profileData?.carrera ?? profileData?.career ?? '';

  const payload = {
    id: userId,
    nombre_completo: profileData?.nombre_completo ?? '',
    universidad,
    facultad: profileData?.facultad ?? '',
    carrera,
    semestre: profileData?.semestre ?? '',
    biografia: profileData?.biografia ?? '',
    ciudad: profileData?.ciudad ?? '',
    intereses: intereses,
    github_url: profileData?.github_url ?? '',
    linkedin_url: profileData?.linkedin_url ?? '',
  };

  
  const { data, error } = await supabaseService
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('*');

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error('No se pudo persistir el perfil en Supabase.');
  }

  return data[0];
}


module.exports = {
  getProfileById,
  updateProfileById
};