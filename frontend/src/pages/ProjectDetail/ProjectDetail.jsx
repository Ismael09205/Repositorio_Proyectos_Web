import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ChevronRight, ExternalLink, Heart, Eye, MessageCircle, Download,
  GraduationCap, Building2, FileText, Tag, FolderGit2,
} from 'lucide-react'
import { fetchProjectById } from '../../services/projectService.js'
import './ProjectDetail.css'

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const response = await fetchProjectById(id)
        setProject(response.project)
      } catch (err) {
        const msg = err.response?.data?.error || err.message || 'No se pudo cargar el proyecto.'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    if (id) load()
  }, [id])

  if (loading) {
    return (
      <div className="project-detail page-enter">
        <div className="container project-detail__state">
          <span className="project-detail__spinner" aria-hidden="true" />
          Cargando proyecto...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="project-detail page-enter">
        <div className="container project-detail__state project-detail__state--error">{error}</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="project-detail page-enter">
        <div className="container project-detail__state">Proyecto no encontrado.</div>
      </div>
    )
  }

  return (
    <div className="project-detail page-enter">
      <header className="container project-detail__header">
        <div className="project-detail__heading">
          {(project.universidad || project.facultad || project.carrera) && (
            <nav className="project-detail__path" aria-label="Ruta institucional">
              <FolderGit2 size={15} />
              {project.universidad && <span>{project.universidad}</span>}
              {project.facultad && (<><ChevronRight size={13} /><span>{project.facultad}</span></>)}
              {project.carrera && (<><ChevronRight size={13} /><span>{project.carrera}</span></>)}
            </nav>
          )}
          <span className="project-detail__category">{project.categoria}</span>
          <h1>{project.titulo}</h1>
          <p className="project-detail__summary">{project.resumen}</p>

          {project.palabras_clave?.length > 0 && (
            <div className="project-detail__topics">
              <Tag size={14} />
              {project.palabras_clave.map((tag) => (
                <span key={tag} className="project-detail__topic">{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="project-detail__stats">
          <div className="project-detail__stat"><Heart size={16} /><strong>{project.likes_count || 0}</strong><small>likes</small></div>
          <div className="project-detail__stat"><Eye size={16} /><strong>{project.visitas_count || 0}</strong><small>visitas</small></div>
          <div className="project-detail__stat"><MessageCircle size={16} /><strong>{project.comments_count || 0}</strong><small>comentarios</small></div>
          <div className="project-detail__stat"><Download size={16} /><strong>{project.descargas_count || 0}</strong><small>descargas</small></div>
        </div>
      </header>

      <div className="container project-detail__layout">
        <main className="project-detail__main">
          <section className="project-detail__readme">
            <div className="project-detail__readme-header">
              <FileText size={15} />
              <span>README.md</span>
            </div>
            <div className="project-detail__readme-body">
              <h2>Descripción del proyecto</h2>
              <p>{project.resumen}</p>
            </div>
          </section>
        </main>

        <aside className="project-detail__sidebar">
          <div className="project-detail__about">
            <h3>Acerca de este repositorio</h3>
            <ul className="project-detail__about-list">
              <li>
                <GraduationCap size={16} />
                <div><strong>Universidad</strong><span>{project.universidad}</span></div>
              </li>
              <li>
                <Building2 size={16} />
                <div><strong>Facultad</strong><span>{project.facultad}</span></div>
              </li>
              <li>
                <FolderGit2 size={16} />
                <div><strong>Carrera</strong><span>{project.carrera}</span></div>
              </li>
              <li>
                <FileText size={16} />
                <div><strong>Tipo de archivo</strong><span>{project.archivo_tipo}</span></div>
              </li>
              <li>
                <Download size={16} />
                <div><strong>Peso</strong><span>{project.archivo_peso || 'No informado'}</span></div>
              </li>
            </ul>

            {project.github_url && (
              <a className="project-detail__github" href={project.github_url} target="_blank" rel="noreferrer">
                <ExternalLink size={16} /> Ver repositorio en GitHub
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}