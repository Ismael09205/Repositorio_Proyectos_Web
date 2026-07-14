import { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import {
  Heart, Eye, MessageCircle, Download, Share2, MoreVertical,
  GraduationCap, Building2, FileText, Tag, FolderGit2, ExternalLink,
  ChevronRight, File
} from 'lucide-react'
import { fetchProjectById, toggleLike } from '../../services/projectService.js'
import { AuthContext } from '../../context/AuthContext'
import Comments from '../../components/Comments/Comments'
import toast from 'react-hot-toast'
import './ProjectDetail.css'

export default function ProjectDetail() {
  const { id } = useParams()
  const { token, user } = useContext(AuthContext)
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [liking, setLiking] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchProjectById(id)
        setProject(data)
        setLikes(data.likes_count || 0)
      } catch (err) {
        const msg = err.response?.data?.error || err.message || 'No se pudo cargar el proyecto.'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    if (id) load()
  }, [id])

  const handleLike = async () => {
    if (!token || !user) {
      toast.error('Debes iniciar sesión para dar likes')
      return
    }

    setLiking(true)
    try {
      const result = await toggleLike(token, id)
      setLiked(result.liked)
      setLikes(result.likes_count)
      toast.success(result.liked ? '¡Te encanta este proyecto!' : 'Like removido')
    } catch (err) {
      console.error('Error toggling like:', err)
      toast.error('Error al procesar el like')
    } finally {
      setLiking(false)
    }
  }

  const getFilePreviewType = (archivo_tipo) => {
    if (!archivo_tipo) return 'unknown'
    const type = archivo_tipo.toLowerCase()
    if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) return 'image'
    if (type.includes('video') || type.includes('mp4') || type.includes('webm')) return 'video'
    if (type.includes('pdf')) return 'pdf'
    return 'document'
  }

  const getFileIcon = (archivo_tipo) => {
    const type = getFilePreviewType(archivo_tipo)
    if (type === 'image') return '🖼️'
    if (type === 'video') return '🎥'
    if (type === 'pdf') return '📄'
    return '📎'
  }

  if (loading) {
    return (
      <div className="project-detail page-enter">
        <div className="project-detail__loading">
          <span className="project-detail__spinner" />
          Cargando proyecto...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="project-detail page-enter">
        <div className="project-detail__error">{error}</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="project-detail page-enter">
        <div className="project-detail__error">Proyecto no encontrado.</div>
      </div>
    )
  }

  return (
    <div className="project-detail project-detail--full-width page-enter">
      <div className="project-detail__container">
        {/* Viewer/Player section */}
        <div className="project-detail__viewer-section">
          <div className="project-detail__viewer-wrapper">
            {getFilePreviewType(project.archivo_tipo) === 'image' ? (
              <div className="project-detail__image-viewer">
                <img src={project.archivo_url} alt={project.titulo} />
              </div>
            ) : getFilePreviewType(project.archivo_tipo) === 'video' ? (
              <video className="project-detail__video-viewer" controls>
                <source src={project.archivo_url} type={project.archivo_tipo} />
                Tu navegador no soporta reproducción de video
              </video>
            ) : getFilePreviewType(project.archivo_tipo) === 'pdf' ? (
              <iframe
                src={`https://docs.google.com/gview?url=${project.archivo_url}&embedded=true`}
                className="project-detail__pdf-viewer"
                title="PDF Viewer"
              />
            ) : (
              <div className="project-detail__file-placeholder">
                <div className="project-detail__file-icon">{getFileIcon(project.archivo_tipo)}</div>
                <h3>{project.titulo}</h3>
                <p>Archivo: {project.archivo_tipo}</p>
                <p className="project-detail__file-size">{project.archivo_peso || 'Tamaño no especificado'}</p>
                <a 
                  href={project.archivo_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-primary"
                >
                  <Download size={16} /> Descargar archivo
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Info and interactions section */}
        <div className="project-detail__info-section container">
          {/* Breadcrumb */}
          {(project.universidad || project.facultad || project.carrera) && (
            <nav className="project-detail__breadcrumb">
              {project.universidad && <span>{project.universidad}</span>}
              {project.facultad && <><ChevronRight size={14} /><span>{project.facultad}</span></>}
              {project.carrera && <><ChevronRight size={14} /><span>{project.carrera}</span></>}
            </nav>
          )}

          {/* Title and description */}
          <div className="project-detail__header">
            <div className="project-detail__header-top">
              <div>
                <h1 className="project-detail__title">{project.titulo}</h1>
                {project.palabras_clave?.length > 0 && (
                  <div className="project-detail__tags">
                    {project.palabras_clave.map((tag) => (
                      <span key={tag} className="project-detail__tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <span className="project-detail__category-badge">{project.categoria}</span>
            </div>

            <p className="project-detail__description">{project.resumen}</p>
          </div>

          {/* Stats bar */}
          <div className="project-detail__stats-bar">
            <div className="project-detail__stats-left">
              <div className="project-detail__stat-item">
                <Eye size={18} />
                <span>{project.visitas_count || 0} visitas</span>
              </div>
              <div className="project-detail__stat-item">
                <MessageCircle size={18} />
                <span>{project.comments_count || 0} comentarios</span>
              </div>
              <div className="project-detail__stat-item">
                <Download size={18} />
                <span>{project.descargas_count || 0} descargas</span>
              </div>
            </div>

            <div className="project-detail__stats-right">
              <button 
                className={`project-detail__action-btn ${liked ? 'liked' : ''}`}
                onClick={handleLike}
                disabled={liking}
              >
                <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                <span>{likes}</span>
              </button>
              <button className="project-detail__action-btn">
                <Share2 size={18} />
              </button>
              <button className="project-detail__action-btn">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* Project info cards */}
          <div className="project-detail__info-grid">
            <div className="project-detail__info-card">
              <GraduationCap size={16} />
              <div>
                <small>Universidad</small>
                <strong>{project.universidad}</strong>
              </div>
            </div>
            <div className="project-detail__info-card">
              <Building2 size={16} />
              <div>
                <small>Facultad</small>
                <strong>{project.facultad}</strong>
              </div>
            </div>
            <div className="project-detail__info-card">
              <FolderGit2 size={16} />
              <div>
                <small>Carrera</small>
                <strong>{project.carrera}</strong>
              </div>
            </div>
            <div className="project-detail__info-card">
              <FileText size={16} />
              <div>
                <small>Tipo</small>
                <strong>{project.archivo_tipo}</strong>
              </div>
            </div>
          </div>

          {/* GitHub link */}
          {project.github_url && (
            <div className="project-detail__github-section">
              <a href={project.github_url} target="_blank" rel="noreferrer" className="project-detail__github-link">
                <ExternalLink size={16} />
                Ver repositorio en GitHub
              </a>
            </div>
          )}

          {/* Comments section */}
          <Comments projectId={id} />
        </div>
      </div>
    </div>
  )
}