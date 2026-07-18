import { useState, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Eye, MessageSquare, Bookmark, Share2 } from 'lucide-react'
import { AuthContext } from '../../context/AuthContext'
import { toggleLike } from '../../services/projectService'
import { getUniversityStyle } from '../../services/mockData'
import toast from 'react-hot-toast'
import './ProjectCard.css'

export default function ProjectCard({ project, variant = 'default', onLikeChange }) {
  const { token, user } = useContext(AuthContext)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  // Sincronizar estado local del like con los cambios externos del prop
  useEffect(() => {
    setLiked(project.is_liked || project.liked || false)
  }, [project.is_liked, project.liked])

  const title = project.titulo || project.title || ''
  const description = project.resumen || project.description || ''
  const likes = project.likes_count ?? project.likes ?? 0
  const views = project.visitas_count ?? project.views ?? 0
  const comments = project.comments_count ?? project.comments ?? 0

  const university = project.universidad || project.university || 'EPN'
  const universityStyle = getUniversityStyle(university)

  // Datos del autor (vienen del backend o mapeados desde MyProjects)
  const autorNombre = project.autor?.nombre_completo || project.autor?.nombre_usuario || project.autor?.username || project.author || 'Usuario'
  const autorAvatar = project.autor?.avatar_url || project.authorAvatar || null

  const getInitials = (nombre) => {
    if (!nombre) return 'U'
    return nombre.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  }

  // Obtener iniciales del título del proyecto para la vista previa por defecto
  const getProjectInitials = (titulo) => {
    if (!titulo) return 'PR'
    const words = titulo.trim().split(/\s+/)
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
    return (words[0][0] + words[1][0]).toUpperCase()
  }

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return ''
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!token || !user) {
      toast.error('Debes iniciar sesión para dar likes')
      return
    }

    setLoading(true)
    try {
      const result = await toggleLike(token, project.id)
      setLiked(result.liked)
      onLikeChange?.(result.likes_count)
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Error al procesar el like')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setSaved(s => !s)
  }

  const handleShare = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const url = `${window.location.origin}/proyecto/${project.id}`

    try {
      await navigator.clipboard.writeText(url)
      toast.success('Enlace copiado al portapapeles')
    } catch (error) {
      console.error('Error al copiar el enlace:', error)
      toast.error('No se pudo copiar el enlace')
    }
  }

  // Degradados de respaldo para el fondo
  const gradients = [
    'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
    'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
    'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',
    'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)',
    'linear-gradient(135deg,#fa709a 0%,#fee140 100%)',
    'linear-gradient(135deg,#30cfd0 0%,#330867 100%)',
    'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)',
    'linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%)',
  ]
  const grad = gradients[project.id % gradients.length]

  // --- Lógica para buscar portada o usar iniciales del proyecto ---
  let previewUrl = project.portada_url || null
  let isImage = !!previewUrl

  // Si no hay portada_url directa, buscamos si el primer archivo de la lista es imagen
  if (!previewUrl && project.archivos && project.archivos.length > 0) {
    const firstImage = project.archivos.find(f => 
      f.tipo?.includes('image') || /\.(png|jpe?g|gif|webp)$/i.test(f.url || f.nombre || '')
    )
    if (firstImage) {
      previewUrl = firstImage.url
      isImage = true
    }
  } else if (!previewUrl && project.archivo_url) {
    // Si solo hay archivo_url simple y es una imagen
    const isFileImage = project.archivo_tipo?.includes('image') || /\.(png|jpe?g|gif|webp)$/i.test(project.archivo_url)
    if (isFileImage) {
      previewUrl = project.archivo_url
      isImage = true
    }
  }

  return (
    <Link to={`/proyecto/${project.id}`} className={`project-card project-card--${variant}`}>
      {/* Image / Project Initials Cover */}
      <div className="project-card__img-wrap">
        {isImage && previewUrl ? (
          <img
            src={previewUrl}
            alt={title}
            className="project-card__img-real"
          />
        ) : (
          /* Vista previa estilizada con las Iniciales del Proyecto */
          <div className="project-card__img" style={{ background: grad }}>
            <div className="project-card__img-pattern" />
            <span className="project-card__img-icon" style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '1px' }}>
              {getProjectInitials(title)}
            </span>
          </div>
        )}
        <button
          className={`project-card__save${saved ? ' saved' : ''}`}
          onClick={handleSave}
          aria-label={saved ? 'Quitar de guardados' : 'Guardar proyecto'}
        >
          <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="project-card__body">
        <span className="project-card__category badge" style={universityStyle}>
          {university}
        </span>

        <h3 className="project-card__title">{title}</h3>

        {variant === 'expanded' && (
          <p className="project-card__desc">{description}</p>
        )}

        <div className="project-card__meta">
          <div className="project-card__author">
            <div className="project-card__author-avatar">
              {autorAvatar ? (
                <img src={autorAvatar} alt={autorNombre} className="project-card__author-avatar-img" />
              ) : (
                getInitials(autorNombre)
              )}
            </div>
            <span>{autorNombre}</span>
            {project.created_at && (
              <>
                <span className="project-card__dot">•</span>
                <span className="project-card__date">{formatearFecha(project.created_at)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="project-card__footer">
        <button
          className={`project-card__stat${liked ? ' project-card__stat--liked' : ''}`}
          onClick={handleLike}
          disabled={loading}
          aria-label={liked ? 'Quitar like' : 'Dar like'}
        >
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          <span>{likes}</span>
        </button>
        <div className="project-card__stat">
          <Eye size={14} />
          <span>{views}</span>
        </div>
        <div className="project-card__stat">
          <MessageSquare size={14} />
          <span>{comments}</span>
        </div>
        <button className="project-card__more" onClick={handleShare} aria-label="Compartir proyecto">
          <Share2 size={14} />
        </button>
      </div>
    </Link>
  )
}