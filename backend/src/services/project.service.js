const { supabaseService } = require('../config/supabase');

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
  const projectIds = projects.map((project) => project.id).filter(Boolean);

  const commentCounts = {};
  if (projectIds.length) {
    const { data: comments, error: commentsError } = await supabaseService
      .from('comentarios')
      .select('proyecto_id')
      .in('proyecto_id', projectIds);

    if (!commentsError && Array.isArray(comments)) {
      comments.forEach((comment) => {
        commentCounts[comment.proyecto_id] = (commentCounts[comment.proyecto_id] || 0) + 1;
      });
    }
  }

  let enriched = projects.map((project) => ({
    ...project,
    comments_count: commentCounts[project.id] || 0,
    favorito_count: project.likes_count || 0,
  }));

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
  const projectIds = projects.map((project) => project.id).filter(Boolean);

  const commentCounts = {};
  if (projectIds.length) {
    const { data: comments, error: commentsError } = await supabaseService
      .from('comentarios')
      .select('proyecto_id')
      .in('proyecto_id', projectIds);

    if (!commentsError && Array.isArray(comments)) {
      comments.forEach((comment) => {
        commentCounts[comment.proyecto_id] = (commentCounts[comment.proyecto_id] || 0) + 1;
      });
    }
  }

  let enriched = projects.map((project) => ({
    ...project,
    comments_count: commentCounts[project.id] || 0,
    favorito_count: project.likes_count || 0,
  }));

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

const getProjectById = async (projectId) => {
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

  const { data: comments, error: commentsError } = await supabaseService
    .from('comentarios')
    .select('id')
    .eq('proyecto_id', projectId);

  const commentsCount = !commentsError && Array.isArray(comments) ? comments.length : 0;

  return {
    ...project,
    comments_count: commentsCount,
    favorito_count: project.likes_count || 0,
  };
};

const createProject = async (projectData, archivos = []) => {

    // Crear el proyecto
    const { data: proyecto, error } = await supabaseService
        .from("proyectos")
        .insert([projectData])
        .select()
        .single();

    if (error) throw error;

    // Si hay archivos, guardarlos
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
    // Verificar si el usuario ya dio like
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
      // Si ya existe, lo eliminamos (unlike)
      const { error: deleteError } = await supabaseService
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) throw deleteError;

      // Disminuir likes_count
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
      // Si no existe, lo creamos (like)
      const { error: insertError } = await supabaseService
        .from('likes')
        .insert([{ proyecto_id: projectId, usuario_id: userId }]);

      if (insertError) throw insertError;

      // Aumentar likes_count
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

const getComments = async (projectId) => {
  const { data, error } = await supabaseService
    .from('comentarios')
    .select('*')
    .eq('proyecto_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data : [];
};

const addComment = async (projectId, userId, contenido) => {
  const { data, error } = await supabaseService
    .from('comentarios')
    .insert([{
      proyecto_id: projectId,
      usuario_id: userId,
      contenido: contenido,
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

module.exports = {
  getMyProjects,
  getAllProjects,
  getProjectById,
  createProject,
  toggleLike,
  getComments,
  addComment,
};
