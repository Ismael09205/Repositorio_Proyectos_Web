const projectService = require('../services/project.service');

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
    const project = await projectService.getProjectById(id);
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
    const { titulo, resumen, universidad, facultad, carrera, categoria, archivo_url, archivo_tipo, archivo_peso, github_url, palabras_clave } = req.body;

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
    if (!archivo_url || !archivo_url.trim()) {
      return res.status(400).json({ error: 'La URL del archivo es requerida.' });
    }
    if (!archivo_tipo || !archivo_tipo.trim()) {
      return res.status(400).json({ error: 'El tipo de archivo es requerido.' });
    }

    const projectData = {
      autor_id: req.user.id,
      titulo: titulo.trim(),
      resumen: resumen.trim(),
      universidad: universidad.trim(),
      facultad: facultad.trim(),
      carrera: carrera.trim(),
      categoria: categoria.trim(),
      archivo_url: archivo_url.trim(),
      archivo_tipo: archivo_tipo.trim(),
      archivo_peso: archivo_peso ? String(archivo_peso).trim() : null,
      github_url: github_url ? String(github_url).trim() : null,
      palabras_clave: Array.isArray(palabras_clave)
        ? palabras_clave.map(String).map((item) => item.trim()).filter(Boolean)
        : String(palabras_clave || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
      visitas_count: 0,
      likes_count: 0,
      descargas_count: 0,
    };

    const project = await projectService.createProject(projectData);
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

    const comments = await projectService.getComments(projectId);

    return res.status(200).json({ comments });
  } catch (error) {
    console.error('getComments error:', error);
    return res.status(500).json({ error: error.message || 'Error obteniendo comentarios.' });
  }
};

const addComment = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { contenido } = req.body;
    const userId = req.user?.id || req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no identificado.' });
    }

    if (!contenido || !contenido.trim()) {
      return res.status(400).json({ error: 'El comentario no puede estar vacío.' });
    }

    const comment = await projectService.addComment(projectId, userId, contenido.trim());

    return res.status(201).json({ comment });
  } catch (error) {
    console.error('addComment error:', error);
    return res.status(500).json({ error: error.message || 'Error agregando comentario.' });
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
};
