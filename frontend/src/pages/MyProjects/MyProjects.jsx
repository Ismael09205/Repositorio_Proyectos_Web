import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Plus, Search, UploadCloud, X,
  GitBranch, GraduationCap, Link2, Folder, FolderOpen, Clock, Heart, Eye
} from 'lucide-react'
import ProjectCard from '../../components/ProjectCard/ProjectCard'
import { useAuth } from '../../context/AuthContext'
import { fetchMyProjects } from '../../services/projectService.js'
import './MyProjects.css'

const CATEGORIES = [
  'Todas',
  'Inteligencia Artificial',
  'Desarrollo Web',
  'Ciencia de Datos',
  'Medio Ambiente',
  'TCNP',
  'IoT',
  'Robótica',
  'Blockchain',
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recientes', icon: Clock },
  { value: 'popular', label: 'Likes', icon: Heart },
  { value: 'views', label: 'Visitas', icon: Eye },
]

const CALL_CODES = {
  'Inteligencia Artificial': 'IA',
  'Desarrollo Web': 'WEB',
  'Ciencia de Datos': 'DAT',
  'Medio Ambiente': 'ECO',
  'TCNP': 'TCN',
  'IoT': 'IOT',
  'Robótica': 'ROB',
  'Blockchain': 'BLK',
}

function getCallTag(categoria, index) {
  const code = CALL_CODES[categoria] || 'GEN'
  return `${code}·${String(index + 1).padStart(3, '0')}`
}

const CATEGORY_ACCENTS = {
  'Inteligencia Artificial': { solid: 'var(--orange)', tint: 'var(--orange-tint)' },
  'Desarrollo Web': { solid: 'var(--red)', tint: 'var(--red-tint)' },
  'Ciencia de Datos': { solid: 'var(--orange)', tint: 'var(--orange-tint)' },
  'Medio Ambiente': { solid: 'var(--green)', tint: 'var(--green-tint)' },
  'TCNP': { solid: 'var(--red)', tint: 'var(--red-tint)' },
  'IoT': { solid: 'var(--orange)', tint: 'var(--orange-tint)' },
  'Robótica': { solid: 'var(--red)', tint: 'var(--red-tint)' },
  'Blockchain': { solid: 'var(--orange)', tint: 'var(--orange-tint)' },
}

function getCategoryAccent(categoria) {
  return CATEGORY_ACCENTS[categoria] || { solid: 'var(--orange)', tint: 'var(--orange-tint)' }
}

export default function MyProjects() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('categoria') || 'Todas')
  const [sort, setSort] = useState(searchParams.get('sort') || 'recent')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageError, setPageError] = useState('')

  const activeCategory = category
  const activeQuery = query.trim()

  const filterLabel = useMemo(() => {
    return activeCategory === 'Todas' ? 'Todas las categorías' : activeCategory
  }, [activeCategory])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setPageError('')
      try {
        const params = {}
        if (activeQuery) params.q = activeQuery
        if (activeCategory && activeCategory !== 'Todas') params.categoria = activeCategory
        if (sort) params.sort = sort

        setSearchParams(params)
        const projects = await fetchMyProjects(token, params)
        setProjects(projects || [])
      } catch (err) {
        console.error('Error cargando mis proyectos:', err)
        const status = err.response?.status
        const msg = status === 401
          ? 'Debes iniciar sesión con una cuenta válida para ver tus proyectos.'
          : 'No se pudieron cargar tus proyectos. Intenta de nuevo más tarde.'
        setPageError(msg)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      load()
    } else {
      setPageError('Inicia sesión para ver y administrar tus proyectos.')
      setProjects([])
    }
  }, [token, activeQuery, activeCategory, sort])

  // Actualizar el estado local cuando cambia un like desde ProjectCard
  const handleLikeChange = (projectId, newLikesCount) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const currentlyLiked = p.is_liked || p.liked || false
          return {
            ...p,
            likes_count: newLikesCount,
            is_liked: !currentlyLiked,
            liked: !currentlyLiked,
          }
        }
        return p
      })
    )
  }

  return (
    <div className="my-projects page-enter">
      <header className="my-projects__masthead container">
        <span className="my-projects__stamp">
          <span className="my-projects__stamp-dot" aria-hidden="true" />
          Catálogo académico
        </span>
        <h1 className="my-projects__title">Tus publicaciones</h1>
        <span className="my-projects__title-rule" aria-hidden="true" />
        <p className="my-projects__subtitle">
          Aquí verás todos tus proyectos subidos. Filtra por categoría, busca por título o
          tecnología, y publica uno nuevo con sus métricas de likes, visitas y comentarios.
        </p>
        <button
          className="my-projects__upload-btn btn btn-primary"
          onClick={() => navigate('/subir-proyecto')}
        >
          <UploadCloud size={17} /> Subir nuevo proyecto
        </button>
      </header>

      <div className="my-projects__toolbar container">
        <div className="my-projects__search-box">
          <Search size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca por título, categoría o palabra clave"
            aria-label="Buscar proyectos"
          />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda"><X size={16} /></button>}
        </div>

        <div className="my-projects__filter-row">
          <div className="my-projects__chip-row" role="group" aria-label="Filtrar por categoría" title={filterLabel}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`my-projects__chip ${category === cat ? 'is-active' : ''}`}
                style={{ '--chip-accent': cat === 'Todas' ? 'var(--ink)' : getCategoryAccent(cat).solid }}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="my-projects__ledger container">
        <span className="my-projects__ledger-line">
          <Folder size={14} />
          <span><strong>{projects.length}</strong> proyecto{projects.length === 1 ? '' : 's'}</span>
          <span className="my-projects__ledger-divider">·</span>
          <span>categoria:{activeCategory === 'Todas' ? 'todas' : activeCategory.toLowerCase().replace(/\s+/g, '-')}</span>
          <span className="my-projects__ledger-divider">·</span>
          <span>orden:{sort}</span>
        </span>

        <div className="my-projects__segmented" role="group" aria-label="Ordenar por">
          <span
            className="my-projects__segment-pill"
            aria-hidden="true"
            style={{
              left: `calc(${SORT_OPTIONS.findIndex((o) => o.value === sort)} * (100% / ${SORT_OPTIONS.length}) + 0.25rem)`,
              width: `calc(100% / ${SORT_OPTIONS.length} - 0.5rem)`,
            }}
          />
          {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={`my-projects__segment ${sort === value ? 'is-active' : ''}`}
              onClick={() => setSort(value)}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {pageError && (
        <div className="alert alert-error container" style={{ marginBottom: '1.5rem' }}>
          {pageError}
        </div>
      )}

      <div className="my-projects__cards container">
        {loading ? (
          <div className="my-projects__empty my-projects__loading">
            <span className="my-projects__spinner" aria-hidden="true" />
            Cargando proyectos...
          </div>
        ) : projects.length === 0 ? (
          <div className="my-projects__empty">
            <div className="my-projects__empty-icon"><FolderOpen size={26} /></div>
            <h2>No tienes proyectos aún</h2>
            <p>Publica tu primer proyecto para que otros estudiantes puedan verlo, darle like y comentarlo.</p>
            <button className="btn btn-primary" onClick={() => navigate('/subir-proyecto')}>
              <Plus size={16} /> Subir mi primer proyecto
            </button>
          </div>
        ) : (
          <div className="my-projects__grid">
            {projects.map((project, index) => {
              const accent = getCategoryAccent(project.categoria)

              const projectData = {
                ...project,
                autor: project.autor || {
                  nombre_completo: user?.profile?.nombre_completo || user?.username || 'Tú',
                  avatar_url: user?.profile?.avatar_url || null,
                }
              }

              return (
                <div
                  key={project.id}
                  className="my-projects__card-wrapper"
                  style={{
                    '--card-accent': accent.solid,
                    '--card-tint': accent.tint,
                    animationDelay: `${Math.min(index, 10) * 40}ms`,
                  }}
                >
                  <div className="my-projects__card-punch" aria-hidden="true">
                    <span /><span />
                  </div>
                  <span className="my-projects__card-tag">{getCallTag(project.categoria, index)}</span>
                  <ProjectCard 
                    project={projectData} 
                    variant="expanded" 
                    onLikeChange={(newLikes) => handleLikeChange(project.id, newLikes)}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}