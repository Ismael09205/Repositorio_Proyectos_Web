import axios from 'axios'

const AUTH_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/auth'
const USER_URL = AUTH_URL.replace('/auth', '/users')

export const registerUser = async (userData) => {
  const response = await axios.post(`${AUTH_URL}/register`, {
    name: userData.name,
    username: userData.username,
    email: userData.email,
    password: userData.password,
    university: userData.university,
    career: userData.career,
  })

  return response.data
}

export const loginUser = async (email, password) => {
  const response = await axios.post(`${AUTH_URL}/login`, {
    email,
    password,
  })

  return response.data
}

export const recoverPassword = async (email) => {
  const response = await axios.post(`${AUTH_URL}/recover`, { email })
  return response.data
}

export const changePassword = async (token, password) => {
  const response = await axios.post(
    `${AUTH_URL}/change-password`,
    { password, token },
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    }
  )

  return response.data
}

export const fetchProfile = async (token) => {
  const response = await axios.get(`${USER_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}
