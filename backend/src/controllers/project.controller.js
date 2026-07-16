const projectService = require('../services/project.service');
const { supabaseService } = require('../config/supabase');

// Extrae el userId del token SOLO si viene presente (lectura pública opcional)
const getOptionalUserId = async (req) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  try {
    const { data, error } = await supabaseService.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user.id;
  } catch (err) {
    return null;
  }
};

const getMyProjects = async (req, res) => {
  try {
    const { q, search, categoria, sort } = req.query;
    const filters = {
      search: q || search || '',
      category: categoria || 'all',
      sort: sort || 'recent',
    };

    const projects = await projectService.getMyProjects(req.user.id, filters);

    return res.status(200).json({ projects });
  } catch (error) {
    console.error('getMyProjects error:', error);
    return res.status(500).json({ error: error.message || 'Error obteniendo proyectos del usuario.' });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const { q, search, categoria, sort } = req.query;
    const filters = {
      search: q || search || '',
      category: categoria || 'all',
      sort: sort || 'recent',
    };

    const projects = await projectService.getAllProjects(filters);

    return res.status(200).json({ projects });
  } catch (error) {
    console.error('getAllProjects error:', error);
    return res.status(500).json({ error: error.message || 'Error obteniendo proyectos.' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = await getOptionalUserId(req);
    const project = await projectService.getProjectById(id, currentUserId);
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado.' });
    }
    return res.status(200).json({ project });
  } catch (error) {
    console.error('getProjectById error:', error);
    return res.status(500).json({ error: error.message || 'Error obteniendo el proyecto.' });
  }
};

const createProject = async (req, res) => {
  try {
  const { 
  titulo,
  resumen,
  universidad,
  facultad,
  carrera,
  categoria,
  archivo_url,
  archivo_tipo,
  archivo_peso,
  github_url,
  palabras_clave,
  archivos
} = req.body;

    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ error: 'El título del proyecto es requerido.' });
    }
    if (!resumen || !resumen.trim()) {
      return res.status(400).json({ error: 'El resumen del proyecto es requerido.' });
    }
    if (!universidad || !universidad.trim()) {
      return res.status(400).json({ error: 'El campo universidad es requerido.' });
    }
    if (!facultad || !facultad.trim()) {
      return res.status(400).json({ error: 'El campo facultad es requerido.' });
    }
    if (!carrera || !carrera.trim()) {
      return res.status(400).json({ error: 'El campo carrera es requerido.' });
    }
    if (!categoria || !categoria.trim()) {
      return res.status(400).json({ error: 'Selecciona una categoría para el proyecto.' });
    }
    if (!Array.isArray(archivos) || archivos.length === 0) {
    return res.status(400).json({
        error: "Debes subir al menos un archivo."
    });
}

    const projectData = {
  autor_id: req.user.id,
  titulo: titulo.trim(),
  resumen: resumen.trim(),
  universidad: universidad.trim(),
  facultad: facultad.trim(),
  carrera: carrera.trim(),
  categoria: categoria.trim(),
  github_url: github_url ? github_url.trim() : null,
  palabras_clave: Array.isArray(palabras_clave)
    ? palabras_clave
    : String(palabras_clave || "")
        .split(",")
        .map(x => x.trim())
        .filter(Boolean),
  visitas_count: 0,
  likes_count: 0,
  descargas_count: 0
}

    const project = await projectService.createProject(projectData, archivos || []);
    return res.status(201).json({ project });
  } catch (error) {
    console.error('createProject error:', error);
    return res.status(500).json({ error: error.message || 'Error creando el proyecto.' });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id || req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no identificado.' });
    }

    const result = await projectService.toggleLike(projectId, userId);

    return res.status(200).json(result);
  } catch (error) {
    console.error('toggleLike error:', error);
    return res.status(500).json({ error: error.message || 'Error al dar like al proyecto.' });
  }
};

const getComments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id || req.user?.user_id || null;

    const comments = await projectService.getComments(projectId, userId);

    return res.status(200).json({ comments });
  } catch (error) {
    console.error('getComments error:', error);
    return res.status(500).json({ error: error.message || 'Error obteniendo comentarios.' });
  }
};

const addComment = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { contenido, padre_id } = req.body;
    const userId = req.user?.id || req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no identificado.' });
    }

    if (!contenido || !contenido.trim()) {
      return res.status(400).json({ error: 'El comentario no puede estar vacío.' });
    }

    const comment = await projectService.addComment(projectId, userId, contenido.trim(), padre_id || null);

    return res.status(201).json({ comment });
  } catch (error) {
    console.error('addComment error:', error);
    return res.status(500).json({ error: error.message || 'Error agregando comentario.' });
  }
};

const toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id || req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no identificado.' });
    }

    const result = await projectService.toggleCommentLike(commentId, userId);

    return res.status(200).json(result);
  } catch (error) {
    console.error('toggleCommentLike error:', error);
    return res.status(500).json({ error: error.message || 'Error al procesar like del comentario.' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await projectService.deleteProject(id, req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('deleteProject error:', error);
    return res.status(400).json({ error: error.message || 'Error eliminando el proyecto.' });
  }
};

const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id; // Obtenido de tu middleware de autenticación (JWT)
    const updateData = req.body;

    const updated = await projectService.updateProject(projectId, userId, updateData);

    return res.status(200).json({
      success: true,
      message: 'Proyecto actualizado correctamente',
      project: updated
    });
  } catch (error) {
    console.error('Error al actualizar el proyecto:', error.message);
    
    if (error.message === 'Proyecto no encontrado') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'No tienes permisos para editar este proyecto') {
      return res.status(403).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
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