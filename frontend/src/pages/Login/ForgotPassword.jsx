import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { recoverPassword } from '../../services/authService.js'
import { translateError } from '../../utils/errorMessages.js'
import './Auth.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    let timer
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Ingresa tu correo electrónico.')
      return
    }
    if (!trimmedEmail.includes('@')) {
      setError('Ingresa un correo válido.')
      return
    }
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await recoverPassword(trimmedEmail)
      setMessage('Revisa tu correo para restablecer la contraseña.')
      setEmail('')
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Error al enviar el correo.'
      setError(translateError(errorMsg))
      
      // Si es rate limit, activar cooldown de 60 segundos
      if (errorMsg.includes('rate limit') || errorMsg.includes('Rate limit')) {
        setCooldown(60)
      }
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
          <h2 className="auth-panel__heading">Recupera tu contraseña</h2>
          <p className="auth-panel__sub">
            Ingresa el correo asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>
      </div>

      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Restablecer contraseña</h1>
            <p className="auth-form-sub">Te enviaremos instrucciones a tu correo electrónico.</p>
          </div>

          {error && <div className="auth-error">
            {error}
            {cooldown > 0 && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Intenta de nuevo en {cooldown} segundos</p>}
          </div>}
          {message && <div className="auth-success">{message}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label">Correo electrónico</label>
              <input
                name="email"
                type="email"
                placeholder="tu@correo.edu.ec"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" className={`auth-submit${loading ? ' loading' : ''}`} disabled={loading || cooldown > 0}>
              {loading ? 'Enviando...' : cooldown > 0 ? `Espera ${cooldown}s` : 'Enviar enlace'}
            </button>
          </form>

          <p className="auth-switch">
            ¿Recordaste tu contraseña?{' '}
            <Link to="/login" className="auth-switch-link">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
