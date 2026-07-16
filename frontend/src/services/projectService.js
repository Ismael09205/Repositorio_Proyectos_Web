import axios from 'axios'
import API_BASE_URL from './apiConfig.js'

const PROJECTS_URL = `${API_BASE_URL}/api/projects`

// 1. Obtener todos los proyectos
export const fetchAllProjects = async (params = {}) => {
  const response = await axios.get(`${PROJECTS_URL}`, { params })
  return response.data.projects
}

// 2. Obtener proyectos del usuario logueado
export const fetchMyProjects = async (token, params = {}) => {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await axios.get(`${PROJECTS_URL}/mine`, {
    headers,
    params,
  })

  return response.data.projects
}

// 3. Crear un nuevo proyecto
export const createProject = async (token, payload) => {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await axios.post(`${PROJECTS_URL}`, payload, {
    headers,
  })

  return response.data.project
}

// 4. Obtener un proyecto por ID
export const fetchProjectById = async (projectId) => {
  const response = await axios.get(`${PROJECTS_URL}/${projectId}`)
  return response.data.project
}

// 5. Dar o quitar Like a un proyecto
export const toggleLike = async (token, projectId) => {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await axios.post(`${PROJECTS_URL}/${projectId}/like`, {}, { headers })
  return response.data
}

// 6. Obtener comentarios del proyecto (Soporta token opcional para verificar likes individuales)
export const fetchComments = async (projectId, token = null) => {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await axios.get(`${PROJECTS_URL}/${projectId}/comments`, { headers })
  return response.data.comments
}

// 7. Agregar un comentario o una respuesta (Soporta padreId opcional para hilos jerárquicos)
export const addComment = async (token, projectId, contenido, padreId = null) => {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await axios.post(
    `${PROJECTS_URL}/${projectId}/comments`, 
    { contenido, padre_id: padreId }, 
    { headers }
  )
  return response.data.comment
}

// 8. Dar o quitar Like a un comentario específico
export const toggleCommentLike = async (token, projectId, commentId) => {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await axios.post(
    `${PROJECTS_URL}/${projectId}/comments/${commentId}/like`, 
    {}, 
    { headers }
  )
  return response.data // Retorna { liked: boolean, likes_count: number }
}

// 9. Eliminar un proyecto (solo el autor puede hacerlo)
export const deleteProject = async (token, projectId) => {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await axios.delete(`${PROJECTS_URL}/${projectId}`, { headers })
  return response.data
}

// 10. Actualizar un proyecto (Editar)
export const updateProject = async (token, projectId, payload) => {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await axios.put(`${PROJECTS_URL}/${projectId}`, payload, {
    headers,
  })
  
  return response.data.project // Retorna el proyecto actualizado
}