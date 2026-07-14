import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Flame, Clock, Star } from 'lucide-react'
import Hero from '../../components/Hero/Hero'
import ProjectCard from '../../components/ProjectCard/ProjectCard'
import { fetchAllProjects } from '../../services/projectService'
import { CATEGORIES } from '../../services/mockData'
import toast from 'react-hot-toast'
import './Home.css'

const FILTERS = [
  { id: 'featured', label: 'Destacados', icon: Flame },
  { id: 'recent', label: 'Recientes', icon: Clock },
  { id: 'top', label: 'Más valorados', icon: Star },
]

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('featured')
  const [searchParams, setSearchParams] = useSearchParams()
  const [alertMessage, setAlertMessage] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  // Load projects from API
  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await fetchAllProjects({ sort: 'recent' })
      setProjects(data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
      toast.error('Error al cargar proyectos')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const featured = projects.slice(0, 6)
  const recent = [...projects]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 6)
  const top = [...projects]
    .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
    .slice(0, 6)

  /*UseEffect para manejar los parámetros de búsqueda y alertas de cancelación y exito de donaciones*/
  useEffect(() => {
    const status = searchParams.get('status');
    
    if (status === 'success') {
      setAlertMessage({
        type: 'success',
        title: '¡Donación Exitosa!',
        text: 'Muchas gracias por apoyar a IdeAgora. Tu contribución nos ayuda a seguir creciendo.'
      });
      // Limpiamos la URL para que no vuelva a salir la alerta si recargan la página
      setSearchParams({});
    } else if (status === 'cancel') {
      setAlertMessage({
        type: 'cancel',
        title: 'Pago Cancelado',
        text: 'El proceso de donación ha sido cancelado. No se realizó ningún cargo.'
      });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const displayProjects = activeFilter === 'featured' ? featured
    : activeFilter === 'recent' ? recent
    : top

  return (
    <div className="home page-enter">
      {/* 3. VENTANITA FLOTANTE (ALERTA DE STRIPE) */}
      {alertMessage && (
        <div className="stripe-alert-overlay">
          <div className={`stripe-alert-card ${alertMessage.type}`}>
            <h3>{alertMessage.title}</h3>
            <p>{alertMessage.text}</p>
            <button className="stripe-alert-btn" onClick={() => setAlertMessage(null)}>
              Aceptar
            </button>
          </div>
        </div>
      )}
      <Hero />

      {/* Featured projects */}
      <section className="home__section container">
        <div className="home__section-header">
          <div>
            <h2 className="section-title">Proyectos destacados</h2>
            <p className="home__section-sub">
              Explora algunos de los proyectos más recientes y destacados de nuestra comunidad.
            </p>
          </div>
          <div className="home__filters">
            {FILTERS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`home__filter-btn${activeFilter === id ? ' home__filter-btn--active' : ''}`}
                onClick={() => setActiveFilter(id)}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
          <Link to="/explorar" className="home__see-all">
            Ver todos <ArrowRight size={15} />
          </Link>
        </div>

        <div className="home__projects-grid">
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
              <p>Cargando proyectos...</p>
            </div>
          ) : displayProjects.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
              <p>No hay proyectos disponibles</p>
            </div>
          ) : (
            displayProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
      </section>

      {/* Categories section */}
      <section className="home__cats-section">
        <div className="container">
          <div className="home__section-header">
            <div>
              <h2 className="section-title">Explora por categoría</h2>
              <p className="home__section-sub">Encuentra proyectos organizados por área de conocimiento.</p>
            </div>
            <Link to="/explorar" className="home__see-all">
              Ver todas <ArrowRight size={15} />
            </Link>
          </div>

          <div className="home__cats-grid">
            {CATEGORIES.map(cat => {
              const count = projects.filter(p => 
                p.categoria?.toLowerCase() === cat.label.toLowerCase()
              ).length
              return (
                <Link
                  key={cat.id}
                  to={`/explorar?categoria=${cat.id}`}
                  className="home__cat-card"
                  style={{ '--cat-bg': cat.color, '--cat-text': cat.textColor }}
                >
                  <div className="home__cat-icon">
                    {cat.label.charAt(0)}
                  </div>
                  <span className="home__cat-label">{cat.label}</span>
                  <span className="home__cat-count">
                    {count} {count === 1 ? 'proyecto' : 'proyectos'}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
      {/* CTA Banner - Done*/}
      <div className='banner__done'>
            {/* CTA Banner */}
      <section className="home__cta container">
        <div className="home__cta-inner">
          <div className="home__cta-text">
            <h2 className="home__cta-title">¿Tienes un proyecto universitario?</h2>
            <p className="home__cta-sub">
              Compártelo con la comunidad y llega a miles de estudiantes e investigadores del Ecuador.
            </p>
          </div>
          <div className="home__cta-actions">
            <Link to="/register" className="btn btn-accent">Publicar proyecto</Link>
            <Link to="/explorar" className="btn btn-outline home__cta-secondary">Explorar proyectos</Link>
          </div>
        </div>
      </section>

      {/* Donaciones*/}
      <section className="home__done container">
        <div className="home__done-inner">
          <div className="info_donate">
            <h2 className="home__done-title">¿Te gustó nuestra página?</h2>
            <p className="home__done-sub">
            Nos puede ayudar con una donación  
            </p>
          </div>
          <div className="home__done-actions">
            <Link to="/done" className="btn btn-done">Donar</Link>
            <Link to="/calificar" className="btn btn-calificar">Calificar</Link>
          </div>
        </div>
      </section>
        </div>  
    </div>
  )
}