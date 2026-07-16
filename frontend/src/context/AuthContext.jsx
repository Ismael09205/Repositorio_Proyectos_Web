import { createContext, useContext, useState, useEffect } from 'react'
import { translateError } from '../utils/errorMessages.js'
import { loginUser, registerUser, registerAdmin, fetchProfile } from '../services/authService.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('pc_user')
    const storedToken = localStorage.getItem('pc_token')

    try {
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser))
        setToken(storedToken)
      }
    } catch {
      logout()
    }

    setLoading(false)
  }, [])

  const saveAuth = (authUser, profile, accessToken) => {
    const fallbackProfile = {
      rol: authUser?.user_metadata?.rol || authUser?.user_metadata?.role || 'estudiante',
      nombre_completo: authUser?.user_metadata?.nombre_completo || '',
      nombre_usuario: authUser?.user_metadata?.nombre_usuario || '',
      avatar_url: authUser?.user_metadata?.avatar_url || null,
      email: authUser?.email || ''
    };

    const fullUser = { 
      auth: authUser, 
      profile: (profile && Object.keys(profile).length > 0) ? profile : fallbackProfile 
    }

    setUser(fullUser)
    setToken(accessToken)
    localStorage.setItem('pc_user', JSON.stringify(fullUser))
    if (accessToken) {
      localStorage.setItem('pc_token', accessToken)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('pc_user')
    localStorage.removeItem('pc_token')
  }

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password)
      const data = response?.data ?? response
      const accessToken = data?.token ?? data?.session?.access_token ?? data?.access_token ?? null
      const userData = data?.user ?? data?.session?.user ?? null

      if (!userData) {
        const backendError = data?.error || 'Credenciales incorrectas'
        const backendInternal = data?.internal || null
        console.error('Login failed:', backendInternal || backendError, data)
        throw new Error(translateError(backendError))
      }

      if (!accessToken) {
        console.error('Login sin token:', data)
        throw new Error('No se recibió token de autenticación después del login.')
      }

      let profile = null
      profile = await fetchProfile(accessToken)

      saveAuth(userData, profile, accessToken)
      return { auth: userData, profile }
    } catch (err) {
        const backendError = err.response?.data?.error || err.message || 'No se pudo iniciar sesión'
        const backendInternal = err.response?.data?.internal || err.message
        console.error('Login error details:', backendInternal, err.response?.data)
        const e = new Error(translateError(backendError))
        e.status = err.response?.status || null
        throw e
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
        const backendError = resData?.error || 'No se pudo registrar el usuario'
        const backendInternal = resData?.internal || null
        console.error('Register failed:', backendInternal || backendError, resData)
        throw new Error(translateError(backendError))
      }

      if (!accessToken) {
        // No hay token porque requiere confirmación. 
        // NO guardamos sesión (saveAuth), el usuario debe verificar su mail primero.
        console.log('Registro exitoso, pero requiere confirmación de correo.');
        return { user: userData, requireConfirmation: true }
      }

      // 4. Si sí hay token (ej: registro directo o si quitan la verificación después)
      let profile = null
      if (accessToken) {
        profile = await fetchProfile(accessToken)
      }

      saveAuth(userData, profile, accessToken)
      return {user: userData, requireConfirmation: false}
    } catch (err) {
      const backendError = err.response?.data?.error || err.message || 'No se pudo registrar'
      const backendInternal = err.response?.data?.internal || err.message
      console.error('Register error details:', backendInternal, err.response?.data)
      const e = new Error(translateError(backendError))
      e.status = err.response?.status || null
      throw e
    }
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
