import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser } from '../services/authService.js'
import { supabase } from '../supabaseClient'
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (session) {
        // Token renovado — actualizamos todo
        setToken(session.access_token)
        setUser(session.user)
        localStorage.setItem('pc_token', session.access_token)
        localStorage.setItem('pc_user', JSON.stringify(session.user))
      } else if (event === 'SIGNED_OUT') {
        logout()
      }
    }
  )

  return () => subscription.unsubscribe() // limpieza al desmontar
}, [])

  const saveAuth = (userData, accessToken) => {
    setUser(userData)
    setToken(accessToken)
    localStorage.setItem('pc_user', JSON.stringify(userData))
    if (accessToken) {
      localStorage.setItem('pc_token', accessToken)
      try {
        // Intentamos establecer la sesión en el cliente Supabase para mantener consistencia
        // (si el SDK acepta solo access_token, lo usará; si requiere refresh, puede ignorarlo)
        supabase.auth.setSession({ access_token: accessToken, refresh_token: accessToken })
      } catch (err) {
        console.warn('No se pudo setear sesión en Supabase client:', err.message || err)
      }
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
      const response = await registerUser(data)
      const resData = response?.data ?? response
      const accessToken = resData?.token ?? resData?.session?.access_token ?? resData?.access_token ?? null
      const userData = resData?.user ?? resData?.session?.user ?? null
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
