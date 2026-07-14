import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, Grid, List, X, Loader } from 'lucide-react'
import ProjectCard from '../../components/ProjectCard/ProjectCard'
import { fetchAllProjects } from '../../services/projectService'
import { CATEGORIES } from '../../services/mockData'
import toast from 'react-hot-toast'
import './Explore.css'

const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'popular', label: 'Más populares' },
  { value: 'views', label: 'Más vistos' },
]

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('categoria') || 'all')
  const [sort, setSort] = useState('recent')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryCounts, setCategoryCounts] = useState({})

  const inputQuery = searchParams.get('q') || ''

  // Load projects from API
  useEffect(() => {
    loadProjects()
  }, [sort])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const params = {
        sort: sort,
      }
      if (inputQuery) params.search = inputQuery
      if (activeCategory && activeCategory !== 'all') params.categoria = activeCategory

      const data = await fetchAllProjects(params)
      setProjects(data || [])

      // Calculate category counts
      const counts = { all: data?.length || 0 }
      CATEGORIES.forEach(cat => {
        counts[cat.id] = (data || []).filter(p => p.categoria?.toLowerCase() === cat.label.toLowerCase()).length
      })
      setCategoryCounts(counts)
    } catch (error) {
      console.error('Error loading projects:', error)
      toast.error('Error al cargar proyectos')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  // Filter projects locally
  const filtered = projects.filter(p => {
    const titulo = p.titulo?.toLowerCase() || ''
    const resumen = p.resumen?.toLowerCase() || ''
    const tags = (p.palabras_clave || []).join(' ').toLowerCase()
    const categoria = p.categoria?.toLowerCase() || ''
    
    const matchQ = !inputQuery || 
      titulo.includes(inputQuery.toLowerCase()) ||
      resumen.includes(inputQuery.toLowerCase()) ||
      tags.includes(inputQuery.toLowerCase()) ||
      categoria.includes(inputQuery.toLowerCase())
    
    const matchCat = activeCategory === 'all' || 
      p.categoria?.toLowerCase() === CATEGORIES.find(c => c.id === activeCategory)?.label.toLowerCase()
    
    return matchQ && matchCat
  }).sort((a, b) => {
    if (sort === 'popular') return (b.likes_count || 0) - (a.likes_count || 0)
    if (sort === 'views') return (b.visitas_count || 0) - (a.visitas_count || 0)
    return new Date(b.created_at || 0) - new Date(a.created_at || 0)
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams(query ? { q: query } : {})
    setActiveCategory('all')
  }

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId)
    const params = {}
    if (inputQuery) params.q = inputQuery
    if (catId !== 'all') params.categoria = catId
    setSearchParams(params)
  }

  return (
    <div className="explore page-enter">
      {/* Header */}
      <div className="explore__header">
        <div className="container">
          <h1 className="explore__title">Explorar proyectos</h1>
          <p className="explore__sub">Descubre proyectos universitarios de todo el Ecuador</p>

          {/* Search */}
          <form className="explore__search" onSubmit={handleSearch}>
            <Search size={18} className="explore__search-icon" />
            <input
              type="text"
              placeholder="Buscar proyectos, tecnologías, autores..."
              className="explore__search-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button type="button" className="explore__search-clear" onClick={() => { setQuery(''); setSearchParams({}) }}>
                <X size={16} />
              </button>
            )}
            <button type="submit" className="explore__search-btn">Buscar</button>
          </form>
        </div>
      </div>

      <div className="explore__body container">
        {/* Sidebar filters */}
        <aside className={`explore__sidebar${showFilters ? ' explore__sidebar--open' : ''}`}>
          <div className="explore__sidebar-header">
            <h3 className="explore__sidebar-title">Filtros</h3>
            <button className="explore__sidebar-close" onClick={() => setShowFilters(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Categories */}
          <div className="explore__filter-group">
            <h4 className="explore__filter-label">Categorías</h4>
            <div className="explore__cat-list">
              <button
                className={`explore__cat-btn${activeCategory === 'all' ? ' explore__cat-btn--active' : ''}`}
                onClick={() => handleCategoryClick('all')}
              >
                Todas
                <span className="explore__cat-count">{categoryCounts.all || 0}</span>
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`explore__cat-btn${activeCategory === cat.id ? ' explore__cat-btn--active' : ''}`}
                  onClick={() => handleCategoryClick(cat.id)}
                  style={activeCategory === cat.id ? { background: cat.color, color: cat.textColor, borderColor: cat.textColor } : {}}
                >
                  {cat.label}
                  <span className="explore__cat-count">{categoryCounts[cat.id] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="explore__filter-group">
            <h4 className="explore__filter-label">Ordenar por</h4>
            <div className="explore__sort-list">
              {SORT_OPTIONS.map(opt => (
                <label key={opt.value} className="explore__sort-option">
                  <input
                    type="radio"
                    name="sort"
                    value={opt.value}
                    checked={sort === opt.value}
                    onChange={() => setSort(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="explore__main">
          {/* Toolbar */}
          <div className="explore__toolbar">
            <div className="explore__results-info">
              <strong>{filtered.length}</strong> proyecto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
              {inputQuery && <span className="explore__query-tag">"{inputQuery}" <button onClick={() => { setQuery(''); setSearchParams({}) }}><X size={12}/></button></span>}
            </div>
            <div className="explore__toolbar-right">
              <button className="explore__filter-toggle btn btn-outline" onClick={() => setShowFilters(f => !f)}>
                <SlidersHorizontal size={15} /> Filtros
              </button>
              <div className="explore__view-toggle">
                <button
                  className={`explore__view-btn${viewMode === 'grid' ? ' active' : ''}`}
                  onClick={() => setViewMode('grid')} aria-label="Vista en grilla"
                >
                  <Grid size={16} />
                </button>
                <button
                  className={`explore__view-btn${viewMode === 'list' ? ' active' : ''}`}
                  onClick={() => setViewMode('list')} aria-label="Vista en lista"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Grid / List */}
          {loading ? (
            <div className="explore__empty">
              <Loader size={40} className="animate-spin" />
              <p>Cargando proyectos...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="explore__empty">
              <p className="explore__empty-icon">🔍</p>
              <h3>Sin resultados</h3>
              <p>No encontramos proyectos para tu búsqueda. Intenta con otros términos.</p>
              <button className="btn btn-primary" onClick={() => { setQuery(''); setActiveCategory('all'); setSearchParams({}) }}>
                Ver todos los proyectos
              </button>
            </div>
          ) : (
            <div className={`explore__projects explore__projects--${viewMode}`}>
              {filtered.map(p => (
                <ProjectCard key={p.id} project={p} variant={viewMode === 'list' ? 'expanded' : 'default'} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}