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

const createProject = async (projectData) => {
  const { data, error } = await supabaseService.from('proyectos').insert([projectData]).select().single();

  if (error) {
    throw error;
  }

  return data;
};

module.exports = {
  getMyProjects,
  getProjectById,
  createProject,
};
