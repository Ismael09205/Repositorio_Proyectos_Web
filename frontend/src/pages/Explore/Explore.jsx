import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  Search, 
  SlidersHorizontal, 
  Grid, 
  List, 
  X, 
  Loader, 
  BookOpen, 
  School, 
  Calendar, 
  ArrowUpDown, 
  Filter, 
  RefreshCw 
} from 'lucide-react'
import ProjectCard from '../../components/ProjectCard/ProjectCard'
import { fetchAllProjects } from '../../services/projectService'
import { UNIVERSIDADES, CATEGORIES_CONFIG } from '../../services/mockData' // Asegura que esta ruta sea correcta
import toast from 'react-hot-toast'
import './Explore.css'
import ilustracion from '../../assets/explorer.png'

const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'popular', label: 'Más populares (Likes)' },
  { value: 'views', label: 'Más vistos' },
]

const MONTHS = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
]

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()

  // --- 1. VALORES APLICADOS (Vienen de la URL - Es lo que renderiza los resultados) ---
  const queryParam = searchParams.get('q') || ''
  const categoryParam = searchParams.get('categoria') || 'all'
  const universityParam = searchParams.get('universidad') || 'all'
  const yearFromParam = searchParams.get('yearFrom') || ''
  const yearToParam = searchParams.get('yearTo') || ''
  const monthParam = searchParams.get('mes') || 'all'
  const sortParam = searchParams.get('sort') || 'recent'

  // --- 2. ESTADOS TEMPORALES (Lo que el usuario selecciona antes de hacer clic en "FILTRAR") ---
  const [tempQuery, setTempQuery] = useState(queryParam)
  const [tempCategory, setTempCategory] = useState(categoryParam)
  const [tempUniversity, setTempUniversity] = useState(universityParam)
  const [tempYearFrom, setTempYearFrom] = useState(yearFromParam)
  const [tempYearTo, setTempYearTo] = useState(yearToParam)
  const [tempMonth, setTempMonth] = useState(monthParam)

  // --- 3. ESTADOS DE DATOS ---
  const [allDownloadedProjects, setAllDownloadedProjects] = useState([]) // Persistencia para contadores globales
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list')
  const [showFilters, setShowFilters] = useState(false) // Sidebar en móvil

  // Sincronizar estados temporales cuando la URL cambia (ej. al limpiar filtros o navegar)
  useEffect(() => {
    setTempQuery(queryParam)
    setTempCategory(categoryParam)
    setTempUniversity(universityParam)
    setTempYearFrom(yearFromParam)
    setTempYearTo(yearToParam)
    setTempMonth(monthParam)
  }, [queryParam, categoryParam, universityParam, yearFromParam, yearToParam, monthParam])

  // --- 4. CARGA INICIAL DESDE LA API ---
  useEffect(() => {
    const loadAllProjects = async () => {
      try {
        setLoading(true)
        // Descargamos el universo de proyectos correspondientes al ordenamiento actual
        const data = await fetchAllProjects({ sort: sortParam })
        setAllDownloadedProjects(data || [])
      } catch (error) {
        console.error('Error loading projects:', error)
        toast.error('Error al sincronizar con el repositorio de IdeAgora')
        setAllDownloadedProjects([])
      } finally {
        setLoading(false)
      }
    }
    loadAllProjects()
  }, [sortParam])

  // --- 5. LÓGICA DE FILTRADO ULTRA COMPRENSIVA (Solo se ejecuta con los parámetros aplicados de la URL) ---
  const filteredAndSortedProjects = useMemo(() => {
    return allDownloadedProjects
      .filter(project => {
        // A. Filtro por Texto de Búsqueda
        if (queryParam) {
          const term = queryParam.toLowerCase()
          const titulo = project.titulo?.toLowerCase() || ''
          const resumen = project.resumen?.toLowerCase() || ''
      
          let autor = '';
          if (typeof project.autor === 'string') {
            autor = project.autor.toLowerCase();
          } else if (Array.isArray(project.autor)) {
            // Si es un array de autores, los une todos en un solo string
            autor = project.autor.map(a => (typeof a === 'string' ? a : a?.nombre || '')).join(' ').toLowerCase();
          } else if (project.autor && typeof project.autor === 'object') {
            // Si el autor es un objeto (ej. { nombre: "Juan" } o { name: "Juan" })
            autor = (project.autor.nombre || project.autor.name || '').toLowerCase();
          } else {
            // Si no hay autor, recurre al objeto de usuario que creó el proyecto
            autor = (project.usuario?.nombre || project.usuario?.name || '').toLowerCase();
          }
          const tags = (project.palabras_clave || []).join(' ').toLowerCase()
          
          if (!titulo.includes(term) && !resumen.includes(term) && !autor.includes(term) && !tags.includes(term)) {
            return false
          }
        }

        // B. Filtro por Categoría
        if (categoryParam !== 'all') {
          if (project.categoria?.toLowerCase() !== categoryParam.toLowerCase()) {
            return false
          }
        }

        // C. Filtro por Universidad (Defensa contra diferencias de tipos de datos string/number)
        if (universityParam !== 'all') {
          const targetUni = UNIVERSIDADES.find(u => String(u.id) === String(universityParam))
          const projectUniId = String(project.universidad_id || '')
          const projectUniName = (project.universidad || '').toLowerCase()

          const matchesId = projectUniId === String(universityParam)
          const matchesName = targetUni ? projectUniName.includes(targetUni.name.toLowerCase()) : false

          if (!matchesId && !matchesName) return false
        }

        // D. Filtro por Rango de Años y Mes
        if (yearFromParam || yearToParam || monthParam !== 'all') {
          const projectDate = project.created_at ? new Date(project.created_at) : null
          if (!projectDate || isNaN(projectDate.getTime())) return false

          const projectYear = projectDate.getFullYear()
          const projectMonth = projectDate.getMonth() + 1 // JS months are 0-11

          if (yearFromParam && projectYear < parseInt(yearFromParam, 10)) return false
          if (yearToParam && projectYear > parseInt(yearToParam, 10)) return false
          
          // Si hay filtro de mes y el rango está activo
          if (monthParam !== 'all' && projectMonth !== parseInt(monthParam, 10)) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortParam === 'popular') return (b.likes_count || 0) - (a.likes_count || 0)
        if (sortParam === 'views') return (b.visitas_count || 0) - (a.visitas_count || 0)
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      })
  }, [allDownloadedProjects, queryParam, categoryParam, universityParam, yearFromParam, yearToParam, monthParam, sortParam])

  // --- 6. CONTADORES GLOBALES PERSISTENTES (Nunca caen a 0 basándose en el total descargado) ---
  const globalFacetCounts = useMemo(() => {
    const counts = {
      categories: { all: allDownloadedProjects.length },
      universities: { all: allDownloadedProjects.length }
    }

    // Inicializar estructuras
    Object.keys(CATEGORIES_CONFIG).forEach(cat => { counts.categories[cat] = 0 })
    UNIVERSIDADES.forEach(uni => { counts.universities[uni.id] = 0 })

    // Mapeo exhaustivo
    allDownloadedProjects.forEach(project => {
      // Contador Categorías
      const matchedCat = Object.keys(CATEGORIES_CONFIG).find(
        cat => cat.toLowerCase() === project.categoria?.toLowerCase()
      )
      if (matchedCat) {
        counts.categories[matchedCat] += 1
      }

      // Contador Universidades
      const matchedUni = UNIVERSIDADES.find(uni => {
        const idMatches = String(project.universidad_id) === String(uni.id)
        const nameMatches = project.universidad ? project.universidad.toLowerCase().includes(uni.name.toLowerCase()) : false
        return idMatches || nameMatches
      })
      if (matchedUni) {
        counts.universities[matchedUni.id] += 1
      }
    })

    return counts
  }, [allDownloadedProjects])

  // --- 7. ACCIONES: APLICAR FILTROS (Solo aquí se escribe en la URL y se ejecuta la búsqueda) ---
  const handleApplyFilters = (e) => {
    if (e) e.preventDefault()

    if (tempYearFrom && tempYearTo && parseInt(tempYearFrom, 10) > parseInt(tempYearTo, 10)) {
      toast.error('El año inicial no puede ser mayor al año final')
      return
    }

    const nextParams = {}
    if (tempQuery) nextParams.q = tempQuery
    if (tempCategory !== 'all') nextParams.categoria = tempCategory
    if (tempUniversity !== 'all') nextParams.universidad = tempUniversity
    if (tempYearFrom) nextParams.yearFrom = tempYearFrom
    if (tempYearTo) nextParams.yearTo = tempYearTo
    if (tempMonth !== 'all') nextParams.mes = tempMonth
    if (sortParam !== 'recent') nextParams.sort = sortParam

    setSearchParams(nextParams)
    setShowFilters(false) // Cierra el panel en móvil si estuviese abierto
    toast.success('Búsqueda científica actualizada')
  }

  // Deshacer/Limpiar filtro específico
  const handleRemoveChip = (key) => {
    const nextParams = {
      q: queryParam,
      categoria: categoryParam,
      universidad: universityParam,
      yearFrom: yearFromParam,
      yearTo: yearToParam,
      mes: monthParam,
      sort: sortParam
    }

    if (key === 'year') {
      delete nextParams.yearFrom
      delete nextParams.yearTo
      delete nextParams.mes
      setTempYearFrom('')
      setTempYearTo('')
      setTempMonth('all')
    } else if (key === 'q') {
      delete nextParams.q
      setTempQuery('')
    } else {
      nextParams[key] = 'all'
      if (key === 'categoria') setTempCategory('all')
      if (key === 'universidad') setTempUniversity('all')
    }

    // Limpieza de nulos
    Object.keys(nextParams).forEach(k => {
      if (!nextParams[k] || nextParams[k] === 'all') delete nextParams[k]
    })

    setSearchParams(nextParams)
  }

  const handleResetAll = () => {
    setTempQuery('')
    setTempCategory('all')
    setTempUniversity('all')
    setTempYearFrom('')
    setTempYearTo('')
    setTempMonth('all')
    setSearchParams({})
    toast.success('Filtros restablecidos')
  }

  // Comprobar si el selector de meses debería mostrarse (cuando hay algún año seleccionado)
  const showMonthSelector = !!(tempYearFrom || tempYearTo)

  return (
    <div className="explore page-enter">
      
      {/* HEADER DE BÚSQUEDA */}
      <header className="explore__header">
        <div className="explore-panel explore-panel--top" style={{ backgroundImage: `url(${ilustracion})` }}></div>
        <div className="container">
          
          <span className="explore__badge">IdeAgora Discovery & Analytics</span>
          <h1 className="explore__title">Explorador de Producción Académica</h1>
          <p className="explore__sub">Buscador unificado de tesis, artículos y proyectos tecnológicos del Ecuador.</p>

          <form className="explore__search-container" onSubmit={handleApplyFilters}>
            <div className="explore__search-box">
              <Search size={20} className="explore__search-icon" />
              <input
                type="text"
                placeholder="Palabras clave, metodología, autores o tecnologías..."
                className="explore__search-input"
                value={tempQuery}
                onChange={e => setTempQuery(e.target.value)}
              />
              {tempQuery && (
                <button 
                  type="button" 
                  className="explore__search-clear" 
                  onClick={() => { setTempQuery(''); updateUrlAfterSearchClear() }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button type="submit" className="explore__search-btn">
              Analizar Resultados
            </button>
          </form>
        </div>
      </header>

      {/* CUERPO DEL EXPLORADOR */}
      <div className="explore__body container">
        
        {/* PANEL LATERAL DE FACETAS (ESTILO SCOPUS) */}
        <aside className={`explore__sidebar${showFilters ? ' explore__sidebar--open' : ''}`}>
          <div className="explore__sidebar-header">
            <h3 className="explore__sidebar-title">Filtros de Búsqueda</h3>
            <button className="explore__sidebar-close" onClick={() => setShowFilters(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Botón Aplicar Principal (Rígido) */}
          <button className="explore__apply-btn" onClick={handleApplyFilters}>
            <Filter size={15} /> Aplicar Filtros Seleccionados
          </button>

          {/* Botón limpiar todo */}
          {(categoryParam !== 'all' || universityParam !== 'all' || queryParam || yearFromParam || yearToParam || monthParam !== 'all') && (
            <button className="explore__clear-all-btn" onClick={handleResetAll}>
              <RefreshCw size={13} /> Restablecer criterios
            </button>
          )}

          {/* FACET 1: CATEGORÍAS */}
          <section className="explore__filter-group">
            <h4 className="explore__filter-label">
              <BookOpen size={14} /> Área de Conocimiento
            </h4>
            <div className="explore__facet-list">
              <button
                type="button"
                className={`explore__facet-btn${tempCategory === 'all' ? ' --active' : ''}`}
                onClick={() => setTempCategory('all')}
              >
                <span>Todas las áreas</span>
                <span className="explore__facet-count">{globalFacetCounts.categories.all}</span>
              </button>

              {Object.entries(CATEGORIES_CONFIG).map(([label, config]) => (
                <button
                  key={label}
                  type="button"
                  className={`explore__facet-btn${tempCategory === label ? ' --active' : ''}`}
                  onClick={() => setTempCategory(label)}
                  style={tempCategory === label ? { borderLeftColor: config.color } : {}}
                >
                  <span className="explore__facet-text-group">
                    <span className="explore__facet-badge" style={{ backgroundColor: config.bg, color: config.color }}>
                      {config.code}
                    </span>
                    {label}
                  </span>
                  <span className="explore__facet-count">{globalFacetCounts.categories[label] || 0}</span>
                </button>
              ))}
            </div>
          </section>

          {/* FACET 2: UNIVERSIDADES */}
          <section className="explore__filter-group">
            <h4 className="explore__filter-label">
              <School size={14} /> Instituciones / Universidades
            </h4>
            <div className="explore__facet-list">
              <button
                type="button"
                className={`explore__facet-btn${tempUniversity === 'all' ? ' --active' : ''}`}
                onClick={() => setTempUniversity('all')}
              >
                <span>Todas las instituciones</span>
                <span className="explore__facet-count">{globalFacetCounts.universities.all}</span>
              </button>

              {UNIVERSIDADES.map(uni => (
                <button
                  key={uni.id}
                  type="button"
                  className={`explore__facet-btn${tempUniversity === uni.id ? ' --active' : ''}`}
                  onClick={() => setTempUniversity(uni.id)}
                >
                  <span className="explore__facet-text-group">
                    <span className="explore__uni-dot" style={{ backgroundColor: uni.color }}></span>
                    {uni.name}
                  </span>
                  <span className="explore__facet-count">{globalFacetCounts.universities[uni.id] || 0}</span>
                </button>
              ))}
            </div>
          </section>

          {/* FACET 3: RANGOS TEMPORALES */}
          <section className="explore__filter-group">
            <h4 className="explore__filter-label">
              <Calendar size={14} /> Año de Publicación
            </h4>
            <div className="explore__year-form">
              <div className="explore__year-inputs">
                <input
                  type="number"
                  placeholder="Año Inicial"
                  min="2015"
                  max={new Date().getFullYear()}
                  className="explore__year-input"
                  value={tempYearFrom}
                  onChange={e => setTempYearFrom(e.target.value)}
                />
                <span className="explore__year-divider">a</span>
                <input
                  type="number"
                  placeholder="Año Final"
                  min="2015"
                  max={new Date().getFullYear()}
                  className="explore__year-input"
                  value={tempYearTo}
                  onChange={e => setTempYearTo(e.target.value)}
                />
              </div>

              {/* Selector de Meses para proyectos del año seleccionado (Filtro Recientes) */}
              {showMonthSelector && (
                <div className="explore__month-select-wrapper animate-fade-in">
                  <label className="explore__month-label">Filtrar por Mes de Publicación</label>
                  <select 
                    className="explore__month-select"
                    value={tempMonth}
                    onChange={e => setTempMonth(e.target.value)}
                  >
                    <option value="all">Cualquier mes del año</option>
                    {MONTHS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </section>
        </aside>

        {/* CONTENEDOR DE RESULTADOS PRINCIPAL */}
        <main className="explore__main">
          
          {/* BARRA DE HERRAMIENTAS */}
          <div className="explore__toolbar">
            <div className="explore__results-info">
              <span>Se encontraron <strong>{filteredAndSortedProjects.length}</strong> documentos indexados</span>
              
              {/* Chips Activos Reales */}
              <div className="explore__active-chips">
                {queryParam && (
                  <span className="explore__active-chip">
                    "{queryParam}" 
                    <button onClick={() => handleRemoveChip('q')}><X size={12}/></button>
                  </span>
                )}
                {categoryParam !== 'all' && (
                  <span className="explore__active-chip">
                    Área: {categoryParam}
                    <button onClick={() => handleRemoveChip('categoria')}><X size={12}/></button>
                  </span>
                )}
                {universityParam !== 'all' && (
                  <span className="explore__active-chip">
                    Inst: {UNIVERSIDADES.find(u => String(u.id) === String(universityParam))?.name.split(' ')[0] || universityParam}
                    <button onClick={() => handleRemoveChip('universidad')}><X size={12}/></button>
                  </span>
                )}
                {(yearFromParam || yearToParam) && (
                  <span className="explore__active-chip">
                    Rango: {yearFromParam || 'Inicio'} - {yearToParam || 'Fin'}
                    {monthParam !== 'all' && `, ${MONTHS.find(m => m.value === monthParam)?.label}`}
                    <button onClick={() => handleRemoveChip('year')}><X size={12}/></button>
                  </span>
                )}
              </div>
            </div>

            <div className="explore__toolbar-right">
              {/* Selector Ordenamiento */}
              <div className="explore__sort-wrapper">
                <ArrowUpDown size={14} className="explore__sort-icon" />
                <select 
                  value={sortParam} 
                  onChange={(e) => {
                    const nextParams = {}
                    if (queryParam) nextParams.q = queryParam
                    if (categoryParam !== 'all') nextParams.categoria = categoryParam
                    if (universityParam !== 'all') nextParams.universidad = universityParam
                    if (yearFromParam) nextParams.yearFrom = yearFromParam
                    if (yearToParam) nextParams.yearTo = yearToParam
                    if (monthParam !== 'all') nextParams.mes = monthParam
                    nextParams.sort = e.target.value
                    setSearchParams(nextParams)
                  }}
                  className="explore__sort-select"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Botones de vista Grid / List */}
              <div className="explore__view-toggle">
                <button
                  className={`explore__view-btn${viewMode === 'list' ? ' active' : ''}`}
                  onClick={() => setViewMode('list')} 
                >
                  <List size={16} />
                </button>
                <button
                  className={`explore__view-btn${viewMode === 'grid' ? ' active' : ''}`}
                  onClick={() => setViewMode('grid')} 
                >
                  <Grid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* LISTA DE PROYECTOS */}
          {loading ? (
            <div className="explore__empty">
              <Loader size={40} className="animate-spin explore__loader-icon" />
              <p className="explore__loading-text">Conectando con la base de datos de IdeAgora...</p>
            </div>
          ) : filteredAndSortedProjects.length === 0 ? (
            <div className="explore__empty">
              <p className="explore__empty-icon">📂</p>
              <h3>No se encontraron proyectos</h3>
              <p>Ningún registro coincide con los criterios especificados. Limpia o ajusta los parámetros e inténtalo de nuevo.</p>
              <button className="btn btn-primary" onClick={handleResetAll}>
                Restablecer Búsqueda
              </button>
            </div>
          ) : (
            <div className={`explore__projects explore__projects--${viewMode}`}>
              {filteredAndSortedProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  variant={viewMode === 'list' ? 'expanded' : 'default'} 
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )

  // Helper local para limpiar la barra de búsqueda y actualizar URL inmediatamente
  function updateUrlAfterSearchClear() {
    const nextParams = {
      categoria: categoryParam,
      universidad: universityParam,
      yearFrom: yearFromParam,
      yearTo: yearToParam,
      mes: monthParam,
      sort: sortParam
    }
    Object.keys(nextParams).forEach(k => {
      if (!nextParams[k] || nextParams[k] === 'all') delete nextParams[k]
    })
    setSearchParams(nextParams)
  }
}