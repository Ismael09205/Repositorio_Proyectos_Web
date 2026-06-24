import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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
    return <div className="project-detail page-enter"><div className="container">Cargando proyecto...</div></div>
  }

  if (error) {
    return <div className="project-detail page-enter"><div className="container">{error}</div></div>
  }

  if (!project) {
    return <div className="project-detail page-enter"><div className="container">Proyecto no encontrado.</div></div>
  }

  return (
    <div className="project-detail page-enter">
      <div className="container project-detail__header">
        <div>
          <span className="project-detail__category">{project.categoria}</span>
          <h1>{project.titulo}</h1>
          <p className="project-detail__summary">{project.resumen}</p>
        </div>
        <div className="project-detail__stats">
          <div>{project.likes_count || 0} likes</div>
          <div>{project.visitas_count || 0} visitas</div>
          <div>{project.comments_count || 0} comentarios</div>
          <div>{project.descargas_count || 0} descargas</div>
        </div>
      </div>
      <div className="container project-detail__body">
        <section className="project-detail__section">
          <h2>Información del proyecto</h2>
          <ul>
            <li><strong>Universidad:</strong> {project.universidad}</li>
            <li><strong>Facultad:</strong> {project.facultad}</li>
            <li><strong>Carrera:</strong> {project.carrera}</li>
            <li><strong>Tipo de archivo:</strong> {project.archivo_tipo}</li>
            <li><strong>Peso:</strong> {project.archivo_peso || 'No informado'}</li>
          </ul>
          {project.github_url && (
            <a className="project-detail__github" href={project.github_url} target="_blank" rel="noreferrer">
              Ver repositorio en GitHub
            </a>
          )}
        </section>

        <section className="project-detail__section">
          <h2>Palabras clave</h2>
          <div className="project-detail__tags">
            {(project.palabras_clave || []).map((tag) => (
              <span key={tag} className="project-detail__tag">{tag}</span>
            ))}
          </div>
        </section>

        <section className="project-detail__section project-detail__description">
          <h2>Descripción extendida</h2>
          <p>{project.resumen}</p>
        </section>
      </div>
    </div>
  )
}
