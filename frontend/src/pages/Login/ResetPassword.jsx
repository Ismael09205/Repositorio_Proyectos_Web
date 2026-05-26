import { useState, useEffect } from 'react'
import { useSearchParams, useLocation, Link, useNavigate } from 'react-router-dom'
import { changePassword } from '../../services/authService.js'
import { translateError } from '../../utils/errorMessages.js'
import './Auth.css'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const accessToken = searchParams.get('access_token') || ''
    const hashParams = new URLSearchParams(location.hash.replace('#', ''))
    const hashToken = hashParams.get('access_token') || hashParams.get('token') || ''
    setToken(accessToken || hashToken)
  }, [searchParams, location.hash])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token.trim()) {
      setError('No se encontró el token de recuperación. Usa el enlace enviado por correo o pégalo manualmente.')
      return
    }
    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      await changePassword(token, password)
      setMessage('Contraseña actualizada correctamente. Ahora puedes iniciar sesión.')
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Error al actualizar la contraseña.'
      setError(translateError(errorMsg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page page-enter">
      <div className="auth-panel auth-panel--left">
        <div className="auth-panel__blob auth-panel__blob--1" />
        <div className="auth-panel__blob auth-panel__blob--2" />
        <div className="auth-panel__content">
          <h2 className="auth-panel__heading">Cambia tu contraseña</h2>
          <p className="auth-panel__sub">
            Usa el enlace recibido en tu correo o pega el token aquí para crear una nueva contraseña.
          </p>
        </div>
      </div>

      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Nueva contraseña</h1>
            <p className="auth-form-sub">Crea una contraseña segura para continuar.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label">Token de recuperación</label>
              <input
                name="token"
                type="text"
                placeholder="Pega aquí tu token si no se cargó automáticamente"
                className="auth-input"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">Contraseña nueva</label>
              <input
                name="password"
                type="password"
                placeholder="Nueva contraseña"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">Confirmar contraseña</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                className="auth-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className={`auth-submit${loading ? ' loading' : ''}`} disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>

          <p className="auth-switch">
            ¿Ya tienes acceso?{' '}
            <Link to="/login" className="auth-switch-link">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
