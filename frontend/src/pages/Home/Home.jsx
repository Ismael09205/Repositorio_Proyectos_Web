import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Flame, Clock, Star } from 'lucide-react'
import Hero from '../../components/Hero/Hero'
import ProjectCard from '../../components/ProjectCard/ProjectCard'
import { MOCK_PROJECTS, CATEGORIES } from '../../services/mockData'
import './Home.css'

const FILTERS = [
  { id: 'featured', label: 'Destacados', icon: Flame },
  { id: 'recent', label: 'Recientes', icon: Clock },
  { id: 'top', label: 'Más valorados', icon: Star },
]

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('featured')

  const featured = MOCK_PROJECTS.filter(p => p.featured)
  const recent = [...MOCK_PROJECTS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)
  const top = [...MOCK_PROJECTS].sort((a, b) => b.likes - a.likes).slice(0, 6)

  const displayProjects = activeFilter === 'featured' ? featured
    : activeFilter === 'recent' ? recent
    : top

  return (
    <div className="home page-enter">
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
          {displayProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
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
            {CATEGORIES.map(cat => (
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
                  {MOCK_PROJECTS.filter(p => p.categoryId === cat.id).length} proyectos
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
    </div>
  )
}