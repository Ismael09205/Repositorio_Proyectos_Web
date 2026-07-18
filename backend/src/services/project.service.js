const { supabaseService } = require('../config/supabase');

// Helper: trae autor (perfil) y primera imagen para una lista de proyectos
async function enrichWithAuthorAndCover(projects) {
  if (!projects.length) return [];

  const projectIds = projects.map((p) => p.id).filter(Boolean);
  const autorIds = [...new Set(projects.map((p) => p.autor_id).filter(Boolean))];

  const { data: autores } = await supabaseService
    .from('profiles')
    .select('id, nombre_completo, username, avatar_url')
    .in('id', autorIds);

  const autoresMap = {};
  (autores || []).forEach((a) => { autoresMap[a.id] = a; });

  const { data: archivos } = await supabaseService
    .from('proyecto_archivos')
    .select('proyecto_id, url, tipo, orden')
    .in('proyecto_id', projectIds)
    .like('tipo', 'image/%')
    .order('orden', { ascending: true });

  const portadaMap = {};
  (archivos || []).forEach((archivo) => {
    if (!portadaMap[archivo.proyecto_id]) {
      portadaMap[archivo.proyecto_id] = archivo.url;
    }
  });

  const commentCounts = {};
  if (projectIds.length) {
    const { data: comments } = await supabaseService
      .from('comentarios')
      .select('proyecto_id')
      .in('proyecto_id', projectIds);

    (comments || []).forEach((comment) => {
      commentCounts[comment.proyecto_id] = (commentCounts[comment.proyecto_id] || 0) + 1;
    });
  }

  return projects.map((project) => ({
    ...project,
    comments_count: commentCounts[project.id] || 0,
    favorito_count: project.likes_count || 0,
    portada_url: portadaMap[project.id] || null,
    autor: autoresMap[project.autor_id] || null,
  }));
}

// Verifica si un usuario (o nadie, si currentUserId es null) le dio like a un proyecto
async function checkUserHasLiked(projectId, currentUserId) {
  if (!currentUserId) return false;
  const { data } = await supabaseService
    .from('likes')
    .select('id')
    .eq('proyecto_id', projectId)
    .eq('usuario_id', currentUserId)
    .maybeSingle();
  return !!data;
}

const getMyProjects = async (userId, filters = {}) => {
  const search = String(filters.search || '').trim().toLowerCase();
  const category = String(filters.category || 'all').trim().toLowerCase();
  const sort = String(filters.sort || 'recent').trim().toLowerCase();

  const query = supabaseService.from('proyectos').select('*').eq('autor_id', userId);
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const projects = Array.isArray(data) ? data : [];
  let enriched = await enrichWithAuthorAndCover(projects);

  if (search) {
    enriched = enriched.filter((project) => {
      const text = [project.titulo, project.resumen, project.universidad, project.facultad, project.carrera, project.categoria, (project.palabras_clave || []).join(' ')].join(' ').toLowerCase();
      return text.includes(search);
    });
  }

  if (category && category !== 'all') {
    enriched = enriched.filter((project) => project.categoria.toLowerCase() === category);
  }

  if (sort === 'popular') {
    enriched.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
  } else if (sort === 'views') {
    enriched.sort((a, b) => (b.visitas_count || 0) - (a.visitas_count || 0));
  } else {
    enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return enriched;
};

const getAllProjects = async (filters = {}) => {
  const search = String(filters.search || '').trim().toLowerCase();
  const category = String(filters.category || 'all').trim().toLowerCase();
  const sort = String(filters.sort || 'recent').trim().toLowerCase();

  const { data, error } = await supabaseService
    .from('proyectos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const projects = Array.isArray(data) ? data : [];
  let enriched = await enrichWithAuthorAndCover(projects);

  if (search) {
    enriched = enriched.filter((project) => {
      const text = [project.titulo, project.resumen, project.universidad, project.facultad, project.carrera, project.categoria, (project.palabras_clave || []).join(' ')].join(' ').toLowerCase();
      return text.includes(search);
    });
  }

  if (category && category !== 'all') {
    enriched = enriched.filter((project) => project.categoria.toLowerCase() === category);
  }

  if (sort === 'popular') {
    enriched.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
  } else if (sort === 'views') {
    enriched.sort((a, b) => (b.visitas_count || 0) - (a.visitas_count || 0));
  } else {
    enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return enriched;
};

// Ahora recibe currentUserId opcional, para saber si YA le dio like, y trae TODOS los archivos
const getProjectById = async (projectId, currentUserId = null) => {
  const { data, error } = await supabaseService.from('proyectos').select('*').eq('id', projectId).single();

  if (error) {
    if (error.code === 'PGRST116' || error.code === 'PGRST102') {
      return null;
    }
    throw error;
  }

  const project = data;
  if (!project) {
    return null;
  }

  const [enrichedProject] = await enrichWithAuthorAndCover([project]);

  // Traemos TODOS los archivos del proyecto (para el visor completo, no solo la portada)
  const { data: archivos } = await supabaseService
    .from('proyecto_archivos')
    .select('*')
    .eq('proyecto_id', projectId)
    .order('orden', { ascending: true });

  const user_has_liked = await checkUserHasLiked(projectId, currentUserId);

  return {
    ...enrichedProject,
    archivos: archivos || [],
    user_has_liked,
  };
};

const createProject = async (projectData, archivos = []) => {

    const { data: proyecto, error } = await supabaseService
        .from("proyectos")
        .insert([projectData])
        .select()
        .single();

    if (error) throw error;

    if (archivos.length > 0) {

        const archivosInsert = archivos.map((archivo, index) => ({
            proyecto_id: proyecto.id,
            nombre: archivo.nombre,
            url: archivo.url,
            tipo: archivo.tipo,
            peso: archivo.peso,
            orden: index + 1
        }));

        const { error: archivosError } = await supabaseService
            .from("proyecto_archivos")
            .insert(archivosInsert);

        if (archivosError) throw archivosError;
    }

    return proyecto;
};

const toggleLike = async (projectId, userId) => {
  try {
    const { data: existingLike, error: checkError } = await supabaseService
      .from('likes')
      .select('id')
      .eq('proyecto_id', projectId)
      .eq('usuario_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116' && checkError.code !== 'PGRST102') {
      throw checkError;
    }

    if (existingLike) {
      const { error: deleteError } = await supabaseService
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) throw deleteError;

      const { data: project } = await supabaseService
        .from('proyectos')
        .select('likes_count')
        .eq('id', projectId)
        .single();

      const newCount = Math.max(0, (project?.likes_count || 1) - 1);

      const { error: updateError } = await supabaseService
        .from('proyectos')
        .update({ likes_count: newCount })
        .eq('id', projectId);

      if (updateError) throw updateError;

      return { liked: false, likes_count: newCount };
    } else {
      const { error: insertError } = await supabaseService
        .from('likes')
        .insert([{ proyecto_id: projectId, usuario_id: userId }]);

      if (insertError) throw insertError;

      const { data: project } = await supabaseService
        .from('proyectos')
        .select('likes_count')
        .eq('id', projectId)
        .single();

      const newCount = (project?.likes_count || 0) + 1;

      const { error: updateError } = await supabaseService
        .from('proyectos')
        .update({ likes_count: newCount })
        .eq('id', projectId);

      if (updateError) throw updateError;

      return { liked: true, likes_count: newCount };
    }
  } catch (error) {
    throw error;
  }
};

const getComments = async (projectId, currentUserId = null) => {
  const { data, error } = await supabaseService
    .from('comentarios')
    .select(`
      *,
      profiles (
        username,
        avatar_url
      ),
      comentario_likes (
        usuario_id
      )
    `)
    .eq('proyecto_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rawComments = Array.isArray(data) ? data : [];

  const formattedComments = rawComments.map(comment => {
    const likes = comment.comentario_likes || [];
    const likes_count = likes.length;

    const ha_dado_like = currentUserId
      ? likes.some(like => like.usuario_id === currentUserId)
      : false;

    const { comentario_likes, ...commentData } = comment;

    return {
      ...commentData,
      likes_count,
      ha_dado_like
    };
  });

  return formattedComments;
};

const addComment = async (projectId, userId, contenido, padreId = null) => {
  const { data, error } = await supabaseService
    .from('comentarios')
    .insert([{
      proyecto_id: projectId,
      usuario_id: userId,
      contenido: contenido,
      padre_id: padreId
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  const { data: profileData } = await supabaseService
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', userId)
    .single();

  return {
    ...data,
    likes_count: 0,
    ha_dado_like: false,
    profiles: profileData || { username: 'Usuario', avatar_url: null }
  };
};

const toggleCommentLike = async (commentId, userId) => {
  const { data: existingLike, error: checkError } = await supabaseService
    .from('comentario_likes')
    .select('id')
    .eq('comentario_id', commentId)
    .eq('usuario_id', userId)
    .single();

  if (checkError && checkError.code !== 'PGRST116' && checkError.code !== 'PGRST102') {
    throw checkError;
  }

  if (existingLike) {
    const { error: deleteError } = await supabaseService
      .from('comentario_likes')
      .delete()
      .eq('id', existingLike.id);

    if (deleteError) throw deleteError;

    const { count, error: countError } = await supabaseService
      .from('comentario_likes')
      .select('*', { count: 'exact', head: true })
      .eq('comentario_id', commentId);

    if (countError) throw countError;

    return { liked: false, likes_count: count || 0 };
  } else {
    const { error: insertError } = await supabaseService
      .from('comentario_likes')
      .insert([{ comentario_id: commentId, usuario_id: userId }]);

    if (insertError) throw insertError;

    const { count, error: countError } = await supabaseService
      .from('comentario_likes')
      .select('*', { count: 'exact', head: true })
      .eq('comentario_id', commentId);

    if (countError) throw countError;

    return { liked: true, likes_count: count || 0 };
  }
};

// Elimina un proyecto (solo su autor puede hacerlo) y limpia sus dependencias
const deleteProject = async (projectId, userId) => {
  const { data: project, error: fetchError } = await supabaseService
    .from('proyectos')
    .select('id, autor_id')
    .eq('id', projectId)
    .single();

  if (fetchError || !project) {
    throw new Error('Proyecto no encontrado.');
  }

  if (project.autor_id !== userId) {
    throw new Error('No tienes permiso para eliminar este proyecto.');
  }

  // Borramos dependencias que no tienen ON DELETE CASCADE hacia proyectos
  const { data: comentariosDelProyecto } = await supabaseService
    .from('comentarios')
    .select('id')
    .eq('proyecto_id', projectId);

  const comentarioIds = (comentariosDelProyecto || []).map((c) => c.id);
  if (comentarioIds.length) {
    await supabaseService.from('comentario_likes').delete().in('comentario_id', comentarioIds);
  }
  await supabaseService.from('comentarios').delete().eq('proyecto_id', projectId);
  await supabaseService.from('likes').delete().eq('proyecto_id', projectId);
  // proyecto_archivos tiene ON DELETE CASCADE, se borra solo al borrar el proyecto

  const { error } = await supabaseService.from('proyectos').delete().eq('id', projectId);
  if (error) throw error;

  return { success: true, message: 'Proyecto eliminado correctamente.' };
};

const updateProject = async (projectId, userId, updateData) => {
  // 1. Buscamos el proyecto en Supabase para validar autoría
  const { data: project, error: fetchError } = await supabaseService
    .from('proyectos')
    .select('id, autor_id')
    .eq('id', projectId)
    .single();

  if (fetchError || !project) {
    throw new Error('Proyecto no encontrado');
  }

  // 2. Control de seguridad: Verificar que el que edita sea el dueño
  if (project.autor_id !== userId) {
    throw new Error('No tienes permisos para editar este proyecto');
  }

  // 3. LISTA BLANCA: Definimos exactamente qué columnas existen en la DB actual
  // Basado estrictamente en tu tabla "public.proyectos"
  const columnasPermitidas = [
    'titulo',
    'resumen',
    'universidad',
    'facultad',
    'carrera',
    'categoria',
    'imagenes_url',
    'github_url',
    'palabras_clave',
    'visitas_count',
    'likes_count',
    'descargas_count'
  ];

  // Filtramos el updateData para dejar SOLO las columnas que sí existen en la tabla
  const datosLimpios = {};
  columnasPermitidas.forEach((columna) => {
    if (updateData[columna] !== undefined) {
      datosLimpios[columna] = updateData[columna];
    }
  });

  // Aseguramos que palabras_clave se guarde como un array si viene como string
  if (datosLimpios.palabras_clave && typeof datosLimpios.palabras_clave === 'string') {
    datosLimpios.palabras_clave = datosLimpios.palabras_clave
      .split(',')
      .map(x => x.trim())
      .filter(Boolean);
  }

  // 4. Actualizar en Supabase usando solo los datos limpios y permitidos
  const { data: updatedProject, error: updateError } = await supabaseService
    .from('proyectos')
    .update(datosLimpios)
    .eq('id', projectId)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  return updatedProject;
};

module.exports = {
  getMyProjects,
  getAllProjects,
  getProjectById,
  createProject,
  toggleLike,
  getComments,
  addComment,
  toggleCommentLike,
  deleteProject,
  updateProject,
};