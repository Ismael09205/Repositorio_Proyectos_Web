import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser, registerAdmin } from '../services/authService.js'
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
    if (storedToken) setToken(storedToken)
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
      // El servicio puede devolver `response` (axios) o `response.data` directamente.
      const data = response?.data ?? response
      const accessToken = data?.token ?? data?.session?.access_token ?? data?.access_token ?? null
      const userData = data?.user ?? data?.session?.user ?? null
      if (!userData) {
        throw new Error(data?.error || 'Credenciales incorrectas')
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
      const response = data?.isAdmin
        ? await registerAdmin(data)
        : await registerUser(data)

      const resData = response?.data ?? response
      const accessToken = resData?.token ?? resData?.session?.access_token ?? resData?.access_token ?? null
      const userData = resData?.user ?? resData?.session?.user ?? resData?.auth?.user ?? null
      if (!userData) {
        throw new Error(resData?.error || 'No se pudo registrar el usuario')
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
