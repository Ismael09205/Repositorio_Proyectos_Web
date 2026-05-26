import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { fetchProfile } from '../../services/authService.js'
import './Profile.css'

export default function Profile() {
  const { user, token, logout } = useAuth()
  const [profile, setProfile] = useState(user)
  const [loading, setLoading] = useState(!user)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    if (!user) {
      setLoading(true)
      fetchProfile(token)
        .then((response) => {
          setProfile(response.user || null)
        })
        .catch((err) => {
          setError(err.response?.data?.error || err.message || 'No se pudo cargar el perfil.')
        })
        .finally(() => setLoading(false))
    }
  }, [token, user, navigate])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return <div className="profile-page"><p>Cargando perfil...</p></div>
  }

  if (error) {
    return (
      <div className="profile-page">
        <p className="profile-error">{error}</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <p>No hay información de perfil disponible.</p>
      </div>
    )
  }

  return (
    <div className="profile-page page-enter">
      <div className="profile-card">
        <h1>Mi perfil</h1>
        <div className="profile-grid">
          <div>
            <strong>Nombre</strong>
            <p>{profile.user_metadata?.name || profile.name || 'Sin nombre'}</p>
          </div>
          <div>
            <strong>Usuario</strong>
            <p>{profile.user_metadata?.username || profile.username || 'Sin usuario'}</p>
          </div>
          <div>
            <strong>Correo</strong>
            <p>{profile.email}</p>
          </div>
          <div>
            <strong>Universidad</strong>
            <p>{profile.user_metadata?.university || 'No definido'}</p>
          </div>
          <div>
            <strong>Carrera</strong>
            <p>{profile.user_metadata?.career || 'No definido'}</p>
          </div>
          <div>
            <strong>Estado</strong>
            <p>{profile.email_confirmed_at ? 'Verificado' : 'No verificado'}</p>
          </div>
        </div>

        <button className="btn btn-accent" onClick={handleLogout}>Cerrar sesión</button>
      </div>
    </div>
  )
}
