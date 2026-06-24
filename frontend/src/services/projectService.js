import axios from 'axios'
import API_BASE_URL from './apiConfig.js'

const PROJECTS_URL = `${API_BASE_URL}/api/projects`

export const fetchMyProjects = async (token, params = {}) => {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await axios.get(`${PROJECTS_URL}/mine`, {
    headers,
    params,
  })

  return response.data
}

export const createProject = async (token, payload) => {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await axios.post(`${PROJECTS_URL}`, payload, {
    headers,
  })

  return response.data.project
}

export const fetchProjectById = async (projectId) => {
  const response = await axios.get(`${PROJECTS_URL}/${projectId}`)
  return response.data
}
