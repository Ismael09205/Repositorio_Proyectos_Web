import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Eye, MessageSquare, Bookmark, MoreHorizontal } from 'lucide-react'
import { AuthContext } from '../../context/AuthContext'
import { toggleLike } from '../../services/projectService'
import { getCategoryStyle } from '../../services/mockData'
import toast from 'react-hot-toast'
import './ProjectCard.css'

export default function ProjectCard({ project, variant = 'default', onLikeChange }) {
  const { token, user } = useContext(AuthContext)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Map backend fields to display fields
  const title = project.titulo || project.title || ''
  const description = project.resumen || project.description || ''
  const likes = project.likes_count ?? project.likes ?? 0
  const views = project.visitas_count ?? project.views ?? 0
  const comments = project.comments_count ?? project.comments ?? 0
  const category = project.categoria || project.category || 'General'
  const categoryId = project.categoryId || 'general'
  
  // Get author info
  const author = project.user?.name || 'Sin Autor'
  const university = project.universidad || project.university || 'Universidad'

  const categoryStyle = getCategoryStyle(categoryId)

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

  // Gradient placeholder when no image
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

  return (
    <Link to={`/proyecto/${project.id}`} className={`project-card project-card--${variant}`}>
      {/* Image */}
      <div className="project-card__img-wrap">
        <div className="project-card__img" style={{ background: grad }}>
          {/* Visual pattern */}
          <div className="project-card__img-pattern" />
          <span className="project-card__img-icon">
            {category.charAt(0).toUpperCase()}
          </span>
        </div>
        {/* Save button */}
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
        <span className="project-card__category badge" style={categoryStyle}>
          {category}
        </span>

        <h3 className="project-card__title">{title}</h3>

        {variant === 'expanded' && (
          <p className="project-card__desc">{description}</p>
        )}

        <div className="project-card__meta">
          <div className="project-card__author">
            <div className="project-card__author-avatar">
              {university.charAt(0).toUpperCase()}
            </div>
            <span>{author}</span>
            <span className="project-card__dot">·</span>
            <span className="project-card__uni">{university}</span>
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
        <button className="project-card__more" aria-label="Más opciones">
          <MoreHorizontal size={14} />
        </button>
      </div>
    </Link>
  )
}