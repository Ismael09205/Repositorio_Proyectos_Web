import { useEffect, useState, useContext, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Heart, Download, Share2,
  GraduationCap, FileText, FolderGit2, ExternalLink,
  ChevronRight, Pencil, ChevronLeft, X, FileArchive,
  FileImage, FileVideo
} from 'lucide-react'
import { fetchProjectById, toggleLike, fetchAllProjects } from '../../services/projectService.js'
import { AuthContext } from '../../context/AuthContext'
import Comments from '../../components/Comments/Comments'
import ProjectCard from '../../components/ProjectCard/ProjectCard'
import toast from 'react-hot-toast'
import './ProjectDetail.css'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user } = useContext(AuthContext)

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [liking, setLiking] = useState(false)
  const [recommendedProjects, setRecommendedProjects] = useState([])
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    const loadProject = async () => {
      setLoading(true)
      try {
        const data = await fetchProjectById(id)
        setProject(data)
        setLikes(data.likes_count || 0)
        setLiked(!!data.user_has_liked)
      } catch (err) {
        const msg = err.response?.data?.error || err.message || 'No se pudo cargar el proyecto.'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadProject()
      setCurrentMediaIndex(0)
    }
  }, [id, token])

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const all = await fetchAllProjects()
        const recommendations = (all || [])
          .filter(p => p.id !== id)
          .sort((a, b) => (b.visitas_count || 0) - (a.visitas_count || 0))
          .slice(0, 4)
        setRecommendedProjects(recommendations)
      } catch (err) {
        console.error('Error al cargar recomendaciones:', err)
      }
    }

    if (project) {
      loadRecommendations()
    }
  }, [project, id])

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('¡Enlace copiado al portapapeles!')
  }

  const getFilePreviewType = (archivo_tipo) => {
    if (!archivo_tipo) return 'unknown'
    const type = archivo_tipo.toLowerCase()
    if (type.includes('image')) return 'image'
    if (type.includes('video')) return 'video'
    // Todo lo que no sea imagen o video caerá como 'document' 
    // y mostrará un placeholder, evitando errores del visor de PDF
    return 'document'
  }

  const getFileIconComponent = (archivo_tipo) => {
    const type = getFilePreviewType(archivo_tipo)
    if (type === 'image') return <FileImage size={22} />
    if (type === 'video') return <FileVideo size={22} />
    return <FileArchive size={22} />
  }

  const isAuthor = (() => {
    if (!user || !project) return false;
    const loggedUserId = user.auth?.id || user.auth?._id || user.auth?.uid || user.id || user._id;
    const projectAuthorId = project.autor_id || project.user_id || project.autor?.id;
    if (!loggedUserId || !projectAuthorId) return false;
    return String(loggedUserId) === String(projectAuthorId);
  })();

  const generateInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  }

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return ''
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const formatFileSize = (peso) => peso || '—'

  // Lista completa de archivos
  const mediaList = project?.archivos?.length
    ? project.archivos
    : project?.archivo_url
      ? [{ url: project.archivo_url, tipo: project.archivo_tipo, nombre: project.titulo }]
      : []

  const currentMedia = mediaList[currentMediaIndex]
  const currentMediaType = getFilePreviewType(currentMedia?.tipo)

  const goToNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % mediaList.length)
  }

  const goToPrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length)
  }

  useEffect(() => {
    if (mediaList.length <= 1) return
    if (currentMediaType === 'video') return

    const duracion = currentMediaType === 'image' ? 5000 : 6000
    const timer = setTimeout(goToNextMedia, duracion)

    return () => clearTimeout(timer)
  }, [currentMediaIndex, mediaList.length, currentMediaType])

  if (loading) {
    return (
      <div className="project-detail__loading-screen">
        <span className="project-detail__spinner" />
        <p>Cargando interfaz...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="project-detail__error-screen">
        <p className="error-emoji">⚠️</p>
        <h3>{error || 'Proyecto no encontrado'}</h3>
        <Link to="/" className="btn btn-primary mt-4">Volver al inicio</Link>
      </div>
    )
  }

  const autorNombre = project.autor?.nombre_completo || project.autor?.username || 'Autor de IdeAgora'
  const autorAvatar = project.autor?.avatar_url || null

  return (
    <div className="yt-layout page-enter">
      <div className="yt-layout__main-container">

        <div className="yt-layout__left-column">

          {/* VISOR DE MEDIOS */}
          <div className="yt-player">
            <div className="yt-player__aspect-ratio">
              {mediaList.length > 0 ? (
                <div className="yt-player__carousel">
                  {currentMediaType === 'image' && (
                    <img
                      src={currentMedia.url}
                      alt={`${project.titulo} - vista ${currentMediaIndex + 1}`}
                      className="yt-player__image"
                    />
                  )}

                  {currentMediaType === 'video' && (
                    <video
                      ref={videoRef}
                      className="yt-player__video"
                      controls
                      autoPlay
                      onEnded={goToNextMedia}
                      key={currentMedia.url}
                    >
                      <source src={currentMedia.url} type={currentMedia.tipo} />
                      Tu navegador no soporta video.
                    </video>
                  )}

                  {currentMediaType === 'document' && (
                    <div className="yt-player__placeholder">
                      {getFileIconComponent(currentMedia.tipo)}
                      <h3>{currentMedia.nombre || project.titulo}</h3>
                      <p>Este documento está disponible para descarga.</p>
                      <button 
                        className="btn btn-primary mt-3"
                        onClick={() => setShowDownloadModal(true)}
                      >
                        <Download size={16} className="mr-2" />
                        Descargar archivo
                      </button>
                    </div>
                  )}

                  {mediaList.length > 1 && (
                    <>
                      <button className="yt-carousel-btn prev" onClick={goToPrevMedia}>
                        <ChevronLeft size={24} />
                      </button>
                      <button className="yt-carousel-btn next" onClick={goToNextMedia}>
                        <ChevronRight size={24} />
                      </button>
                      <div className="yt-carousel-indicators">
                        {mediaList.map((_, idx) => (
                          <span
                            key={idx}
                            className={`indicator-dot ${idx === currentMediaIndex ? 'active' : ''}`}
                            onClick={() => setCurrentMediaIndex(idx)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="yt-player__placeholder">
                  <FileArchive size={40} />
                  <h3>{project.titulo}</h3>
                  <p>Sin archivos adjuntos.</p>
                </div>
              )}
            </div>
          </div>

          {/* DETALLES DEL PROYECTO */}
          <div className="yt-details-box">
            <h1 className="yt-info__title">{project.titulo}</h1>

            <div className="yt-actions-row">
              <div className="yt-author-card">
                <div className="yt-author-avatar">
                  {autorAvatar ? (
                    <img src={autorAvatar} alt={autorNombre} />
                  ) : (
                    <div className="avatar-fallback">{generateInitials(autorNombre)}</div>
                  )}
                </div>
                <div className="yt-author-meta">
                  <span className="author-name">{autorNombre}</span>
                  <span className="author-sub">
                    {project.universidad || 'Universidad no asignada'}
                    {project.created_at && ` • ${formatearFecha(project.created_at)}`}
                  </span>
                </div>

                {isAuthor && (
                  <button
                    className="btn-edit-project"
                    onClick={() => navigate(`/editar-proyecto/${project.id || id}`)}
                  >
                    <Pencil size={14} /> Editar
                  </button>
                )}
              </div>

              <div className="yt-buttons-group">
                <button
                  className={`yt-btn yt-btn--like ${liked ? 'liked' : ''}`}
                  onClick={handleLike}
                  disabled={liking}
                >
                  <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                  <span>{likes}</span>
                </button>

                <button className="yt-btn" onClick={handleShare}>
                  <Share2 size={16} />
                  <span className="hide-mobile">Compartir</span>
                </button>

                <button className="yt-btn yt-btn--download" onClick={() => setShowDownloadModal(true)}>
                  <Download size={16} />
                  <span>Descargar</span>
                </button>
              </div>
            </div>

            {/* Caja de Descripción */}
            <div className="yt-description-card">
              <div className="yt-description-meta">
                <span><strong>{project.visitas_count || 0}</strong> visualizaciones</span>
                <span>•</span>
                <span>Categoría: <strong>{project.categoria || 'Sin categoría'}</strong></span>
              </div>

              <p className="yt-description-text">{project.resumen}</p>

              {project.palabras_clave?.length > 0 && (
                <div className="yt-description-tags">
                  {project.palabras_clave.map((tag) => (
                    <span key={tag} className="yt-tag">#{tag}</span>
                  ))}
                </div>
              )}

              <hr className="desc-divider" />

              <div className="yt-meta-grid">
                <div className="yt-meta-item">
                  <GraduationCap size={16} />
                  <span><strong>Facultad:</strong> {project.facultad || 'N/A'}</span>
                </div>
                <div className="yt-meta-item">
                  <FolderGit2 size={16} />
                  <span><strong>Carrera:</strong> {project.carrera || 'N/A'}</span>
                </div>
                <div className="yt-meta-item">
                  <FileText size={16} />
                  <span><strong>Archivos:</strong> {mediaList.length}</span>
                </div>
                {project.github_url && (
                  <div className="yt-meta-item">
                    <ExternalLink size={16} />
                    <a href={project.github_url} target="_blank" rel="noreferrer" className="yt-meta-github">
                      GitHub
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        <div className="yt-layout__right-column">
          <div className="yt-comments-wrapper">
            <Comments projectId={id} />
          </div>
        </div>

      </div>

      {/* MODAL DE DESCARGA */}
      {showDownloadModal && (
        <div className="download-modal-overlay" onClick={() => setShowDownloadModal(false)}>
          <div className="download-modal" onClick={(e) => e.stopPropagation()}>
            <div className="download-modal__header">
              <h3>Descargar archivos</h3>
              <button className="download-modal__close" onClick={() => setShowDownloadModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="download-modal__list">
              {mediaList.length > 0 ? (
                mediaList.map((archivo, idx) => (
                  <div key={idx} className="download-modal__item">
                    <div className="download-modal__item-icon">
                      {getFileIconComponent(archivo.tipo)}
                    </div>
                    <div className="download-modal__item-info">
                      <span className="download-modal__item-name">{archivo.nombre || `Archivo ${idx + 1}`}</span>
                      <span className="download-modal__item-meta">{formatFileSize(archivo.peso)}</span>
                    </div>
                    
                    <a
                      href={archivo.url}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="download-modal__item-btn"
                    >
                      <Download size={16} />
                    </a>
                  </div>
                ))
              ) : (
                <p className="download-modal__empty">No hay archivos disponibles.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <section className="yt-recommendations-fullwidth">
        <div className="yt-recommendations-container">
          <h2 className="section-title">Te puede interesar</h2>
          {recommendedProjects.length === 0 ? (
            <p className="no-recommendations">No hay proyectos recomendados para mostrar.</p>
          ) : (
            <div className="recommendations-fullgrid">
              {recommendedProjects.map(proj => (
                <ProjectCard key={proj.id} project={proj} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}