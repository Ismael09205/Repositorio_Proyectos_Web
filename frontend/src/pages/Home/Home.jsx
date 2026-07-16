import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Flame, Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import Hero from '../../components/Hero/Hero'
import ProjectCard from '../../components/ProjectCard/ProjectCard'
import { fetchAllProjects } from '../../services/projectService'
import { UNIVERSIDADES, matchesUniversity } from '../../services/mockData'
import { ChatFlotante } from '../../components/ChatFlotante/ChatFlotante';
// 1. IMPORTA TU CONTEXTO DE AUTENTICACIÓN (Ajusta la ruta según la estructura de tu proyecto)
import { useAuth } from '../../context/AuthContext' 
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

  // 2. EXTRAE EL USUARIO ACTIVO DE TU CONTEXTO DE AUTENTICACIÓN
  const { user } = useAuth() 

  const projectsScrollRef = useRef(null)
  const unisScrollRef = useRef(null)

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

  const handleScroll = (ref, direction) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      
      ref.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  const featured = projects.slice(0, 10)
  const recent = [...projects].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 10)
  const top = [...projects].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)).slice(0, 10)

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      setAlertMessage({
        type: 'success',
        title: '¡Donación Exitosa!',
        text: 'Muchas gracias por apoyar a IdeAgora. Tu contribución nos ayuda a seguir creciendo.'
      });
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
      <section className="home__section">
        <div className="container">
          <div className="home__section-header">
            <div>
              <h2 className="section-title">Proyectos destacados</h2>
              <p className="home__section-sub">
                Explora algunos de los proyectos más recientes y destacados de nuestra comunidad.
              </p>
            </div>
            <div className="home__header-actions">
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
          </div>
        </div>
        
        <div className="home__slider-wrapper">
          <button className="home__slider-arrow left" onClick={() => handleScroll(projectsScrollRef, 'left')}>
            <ChevronLeft size={24} />
          </button>

          <div className="home__projects-slider" ref={projectsScrollRef}>
            {loading ? (
              <div className="home__slider-status-msg">
                <p>Cargando proyectos...</p>
              </div>
            ) : displayProjects.length === 0 ? (
              <div className="home__slider-status-msg">
                <p>No hay proyectos disponibles</p>
              </div>
            ) : (
              displayProjects.map(project => (
                <div key={project.id} className="home__slider-item">
                  <ProjectCard project={project} />
                </div>
              ))
            )}
          </div>

          <button className="home__slider-arrow right" onClick={() => handleScroll(projectsScrollRef, 'right')}>
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* Universidades section */}
      <section className="home__cats-section">
        <div className="container">
          <div className="home__section-header">
            <div>
              <h2 className="section-title">Explora por universidad</h2>
              <p className="home__section-sub">Encuentra proyectos organizados por las principales universidades del país.</p>
            </div>
          </div>
        </div>

        <div className="home__slider-wrapper">
          <button className="home__slider-arrow left" onClick={() => handleScroll(unisScrollRef, 'left')}>
            <ChevronLeft size={24} />
          </button>

          {/* Reemplaza el bloque de mapeo de universidades por este */}
          <div className="home__cats-slider" ref={unisScrollRef}>
            {UNIVERSIDADES.slice(0, 10).map(uni => {
              // Usamos tu función de coincidencia flexible para contar los proyectos reales
              const count = projects.filter(p => matchesUniversity(p.universidad, uni)).length

              return (
                <div key={uni.id} className="home__slider-item-uni">
                  <Link
                    to={`/universidad/${uni.id}`} // <--- Redirección exacta a tu ruta dinámica
                    className="home__cat-card home__uni-card"
                    style={{
                      // Inyectamos tus colores exactos de mockData.js como propiedades de CSS
                      '--uni-color': uni.color,
                      '--uni-text-color': uni.textColor
                    }}
                  >
                    <div className="home__uni-img-container">
                      <img 
                        src={uni.image} 
                        alt={`Logo de ${uni.name}`} 
                        className="home__uni-logo" 
                        loading="lazy"
                      />
                    </div>
                    <span className="home__cat-label">{uni.name}</span>
                    <span className="home__cat-count">
                      {count} {count === 1 ? 'proyecto' : 'proyectos'}
                    </span>
                  </Link>
                </div>
              )
            })}
          </div>

          <button className="home__slider-arrow right" onClick={() => handleScroll(unisScrollRef, 'right')}>
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* CTA Banner & Donaciones */}
      <div className='banner__done'>
        <div className='banner__done-container'>
            <section className="home__cta container">
          <div className="home__cta-inner">
            <div className="home__cta-text">
              <h2 className="home__cta-title">¿Tienes un proyecto universitario?</h2>
              <p className="home__cta-sub">
                Compártelo con la comunidad y llega a miles de estudiantes e investigadores del Ecuador.
              </p>
            </div>
            <div className="home__cta-actions">
              {/* 3. LÓGICA DINÁMICA: Si existe el usuario va a publicar, si no va al registro/login */}
              <Link 
                to={user ? "/subir-proyecto" : "/register"} 
                className="btn btn-accent"
                onClick={() => {
                  if (!user) {
                    toast('Inicia sesión o regístrate para publicar tus proyectos')
                  }
                }}
              >
                Publicar proyecto
              </Link>
              <Link to="/explorar" className="btn btn-outline home__cta-secondary">Explorar proyectos</Link>
            </div>
          </div>
        </section>

        <section className="home__done container">
          <div className="home__done-inner">
            <div className="info_donate">
              <h2 className="home__done-title">¿Te gustó nuestra página?</h2>
              <p className="home__done-sub">
                Nos puedes ayudar con una donación  
              </p>
            </div>
            
            <div className="home__done-actions">
              {/* Si está logueado va a /done, si no, se le invita a registrarse */}
              <Link 
                to={user ? "/done" : "/register"} 
                className="btn btn-done"
                onClick={() => {
                  if (!user) {
                    toast('Inicia sesión o regístrate para donar. Agradecemos tu apoyo!!!', { icon: '😊' })
                  }
                }}
              >
                Donar
              </Link>
              
              {/* Opcional: También puedes proteger el botón de Calificar si requiere cuenta */}
              <Link 
                to={user ? "/calificar" : "/register"} 
                className="btn btn-calificar"
                onClick={() => {
                  if (!user) {
                    toast('Inicia sesión o regístrate para calificar la plataforma')
                  }
                }}
              >
                Calificar
              </Link>
            </div>
          </div>
        </section>
        </div>
      </div>  
      <ChatFlotante />
    </div>
  )
}