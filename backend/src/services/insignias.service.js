const { supabaseService } = require('../config/supabase');

/* Definicion de niveles de insignia segun cantidad de proyectos subidos */
const NIVELES_INSIGNIA = [
  { nombre: 'Explorador',    minProyectos: 1,  emoji: '🔭', color: '#6b7280' },
  { nombre: 'Constructor',   minProyectos: 3,  emoji: '🔨', color: '#3b82f6' },
  { nombre: 'Innovador',     minProyectos: 5,  emoji: '💡', color: '#8b5cf6' },
  { nombre: 'Pionero',       minProyectos: 10, emoji: '🚀', color: '#f59e0b' },
  { nombre: 'Maestro',       minProyectos: 20, emoji: '🏆', color: '#ef4444' },
];

/* Calcula que insignia le corresponde segun el numero de proyectos */
const calcularInsignia = (totalProyectos) => {
  let insigniaActual = null;
  for (const nivel of NIVELES_INSIGNIA) {
    if (totalProyectos >= nivel.minProyectos) {
      insigniaActual = nivel;
    }
  }
  return insigniaActual;
};

/* Obtiene el conteo de proyectos y la insignia efectiva del usuario */
const obtenerInsigniaUsuario = async (usuarioId) => {
  // Contamos los proyectos del usuario
  const { data: proyectos, error: errProy } = await supabaseService
    .from('proyectos')
    .select('id')
    .eq('autor_id', usuarioId);

  if (errProy) throw errProy;

  const totalProyectos = (proyectos || []).length;
  const insigniaAuto = calcularInsignia(totalProyectos);

  // Verificamos si el admin le asigno una insignia manual
  const { data: manual } = await supabaseService
    .from('insignias_usuarios')
    .select('*')
    .eq('usuario_id', usuarioId)
    .maybeSingle();

  // La insignia efectiva: manual tiene prioridad sobre la automatica
  const insigniaEfectiva = manual || insigniaAuto;

  return {
    totalProyectos,
    insigniaAuto,
    insigniaManual: manual || null,
    insignia: insigniaEfectiva,
    niveles: NIVELES_INSIGNIA,
  };
};

/* Lista todos los estudiantes con su insignia calculada automaticamente */
const listarInsigniasUsuarios = async () => {
  // Solo perfiles con rol 'estudiante' (tabla profiles)
  // El campo se llama username en el esquema, no nombre_usuario
  const { data: perfiles, error: errPerfiles } = await supabaseService
    .from('profiles')
    .select('id, nombre_completo, username, avatar_url, universidad')
    .eq('rol', 'estudiante');

  if (errPerfiles) throw errPerfiles;

  // Todos los autor_id de proyectos para contar por usuario
  const { data: proyectos, error: errProyectos } = await supabaseService
    .from('proyectos')
    .select('autor_id');

  if (errProyectos) throw errProyectos;

  // Mapa de conteo: autor_id -> cantidad de proyectos
  const contadorProyectos = {};
  for (const p of proyectos || []) {
    contadorProyectos[p.autor_id] = (contadorProyectos[p.autor_id] || 0) + 1;
  }

  // Insignias manuales ya guardadas por el admin
  const { data: insigniasGuardadas } = await supabaseService
    .from('insignias_usuarios')
    .select('*');

  const mapaInsignias = {};
  for (const ig of insigniasGuardadas || []) {
    mapaInsignias[ig.usuario_id] = ig;
  }

  // Construimos la lista final usando el campo correcto 'username'
  const resultado = (perfiles || []).map((perfil) => {
    const totalProyectos = contadorProyectos[perfil.id] || 0;
    const insigniaAuto = calcularInsignia(totalProyectos);
    const insigniaManual = mapaInsignias[perfil.id] || null;

    return {
      usuarioId: perfil.id,
      // nombre_completo tiene prioridad; si no existe usamos username
      nombre: perfil.nombre_completo || perfil.username || 'Sin nombre',
      avatar: perfil.avatar_url || null,
      universidad: perfil.universidad || '',
      totalProyectos,
      insigniaAuto,
      insigniaManual,
      // La insignia efectiva: manual tiene prioridad sobre la automatica
      insigniaEfectiva: insigniaManual || insigniaAuto,
    };
  });

  return resultado;
};

/* Asigna o actualiza la insignia manual de un usuario (solo admin) */
const asignarInsignia = async (usuarioId, nombreInsignia, adminId) => {
  // Verificamos que el nombre de insignia sea valido
  const nivelValido = NIVELES_INSIGNIA.find((n) => n.nombre === nombreInsignia);
  if (!nivelValido) {
    throw new Error(`Insignia invalida. Opciones: ${NIVELES_INSIGNIA.map((n) => n.nombre).join(', ')}`);
  }

  // Upsert en tabla insignias_usuarios
  const { data, error } = await supabaseService
    .from('insignias_usuarios')
    .upsert(
      {
        usuario_id: usuarioId,
        nombre: nivelValido.nombre,
        emoji: nivelValido.emoji,
        color: nivelValido.color,
        asignada_por: adminId,
        asignada_en: new Date().toISOString(),
      },
      { onConflict: 'usuario_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

/* Elimina la insignia manual de un usuario (vuelve a ser automatica) */
const removerInsignia = async (usuarioId) => {
  const { error } = await supabaseService
    .from('insignias_usuarios')
    .delete()
    .eq('usuario_id', usuarioId);

  if (error) throw error;
  return { success: true, mensaje: 'Insignia manual removida. Ahora es automatica.' };
};

/* Obtiene estadisticas generales para el dashboard admin */
const obtenerEstadisticas = async () => {
  // Total de proyectos publicados
  const { count: totalProyectos } = await supabaseService
    .from('proyectos')
    .select('*', { count: 'exact', head: true });

  // Solo proyectos para categorias y meses
  const { data: porCategoria } = await supabaseService
    .from('proyectos')
    .select('categoria');

  const { data: proyectosTodos } = await supabaseService
    .from('proyectos')
    .select('created_at');

  // Total de estudiantes registrados (solo tabla profiles con rol estudiante)
  const { count: totalUsuarios } = await supabaseService
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('rol', 'estudiante');

  // Autores unicos que han subido al menos 1 proyecto
  const { data: autores } = await supabaseService
    .from('proyectos')
    .select('autor_id');

  const autoresUnicos = new Set((autores || []).map((p) => p.autor_id)).size;

  // Logins registrados en auth_logs (accion 'login') agrupados por mes
  // Usamos solo registros de rol 'estudiante' para no contar admins
  const { data: logins } = await supabaseService
    .from('auth_logs')
    .select('created_at, rol')
    .eq('action', 'login')
    .eq('rol', 'estudiante');

  // Agrupamos proyectos por categoria
  const contadorCategorias = {};
  for (const p of porCategoria || []) {
    const cat = p.categoria || 'Sin categoria';
    contadorCategorias[cat] = (contadorCategorias[cat] || 0) + 1;
  }

  // Agrupamos proyectos por dia (clave YYYY-MM-DD) — ultimos 30 dias
  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - 30);

  const contadorDias = {};
  for (const p of proyectosTodos || []) {
    const fecha = new Date(p.created_at);
    if (fecha < hace30Dias) continue; // solo los ultimos 30 dias
    const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    contadorDias[clave] = (contadorDias[clave] || 0) + 1;
  }

  // Agrupamos logins por dia (ultimos 30 dias)
  const loginsPorDia = {};
  for (const l of logins || []) {
    const fecha = new Date(l.created_at);
    if (fecha < hace30Dias) continue;
    const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    loginsPorDia[clave] = (loginsPorDia[clave] || 0) + 1;
  }

  return {
    totalProyectos: totalProyectos || 0,
    totalUsuarios: totalUsuarios || 0,
    autoresActivos: autoresUnicos,
    porCategoria: contadorCategorias,
    porDia: contadorDias,
    loginsPorDia,
    niveles: NIVELES_INSIGNIA,
  };
};

module.exports = {
  calcularInsignia,
  obtenerInsigniaUsuario,
  listarInsigniasUsuarios,
  asignarInsignia,
  removerInsignia,
  obtenerEstadisticas,
  NIVELES_INSIGNIA,
};
