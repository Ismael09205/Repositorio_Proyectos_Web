import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser } from '../services/authService.js'
import { translateError } from '../utils/errorMessages.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('pc_user')
    const storedToken = localStorage.getItem('pc_token')
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)) } catch {}
    }
    if (storedToken) {
      setToken(storedToken)
    }
    setLoading(false)
  }, [])

  const saveAuth = (userData, accessToken) => {
    setUser(userData)
    setToken(accessToken)
    localStorage.setItem('pc_user', JSON.stringify(userData))
    if (accessToken) {
      localStorage.setItem('pc_token', accessToken)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password)
      const payload = response?.data?.data || response?.data
      const accessToken = payload?.session?.access_token || payload?.access_token || null
      const userData = payload?.user || payload?.session?.user || payload || null
      if (!userData) {
        throw new Error(response?.data?.error || 'Credenciales incorrectas')
      }
      saveAuth(userData, accessToken)
      return userData
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'No se pudo iniciar sesión'
      throw new Error(translateError(errorMsg))
    }
  }

  const register = async (data) => {
    try {
      const response = await registerUser(data)
      const payload = response?.data?.data || response?.data
      const accessToken = payload?.session?.access_token || payload?.access_token || null
      const userData = payload?.user || payload?.session?.user || payload || null
      if (!userData) {
        throw new Error(response?.data?.error || 'No se pudo registrar el usuario')
      }
      saveAuth(userData, accessToken)
      return userData
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'No se pudo registrar'
      throw new Error(translateError(errorMsg))
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('pc_user')
    localStorage.removeItem('pc_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
