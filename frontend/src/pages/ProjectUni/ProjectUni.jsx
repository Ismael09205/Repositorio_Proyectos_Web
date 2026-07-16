import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Search, Clock, Flame, Star, BookOpen } from 'lucide-react'
import { UNIVERSIDADES } from '../../services/mockData'
import { fetchAllProjects } from '../../services/projectService'
import ProjectCard from '../../components/ProjectCard/ProjectCard'
import toast from 'react-hot-toast'
import './ProjectUni.css'

const FACULTADES = [
  { id: 'all', label: 'Todas las Facultades' },
  { id: 'sistemas', label: 'Sistemas e Informática' },
  { id: 'ciencias', label: 'Ciencias Exactas' },
  { id: 'ingenierias', label: 'Ingenierías' },
  { id: 'administracion', label: 'Administración y Negocios' },
]

export default function ProjectUni() {
  // 1. OBTENER EL ID DE LA URL
  const params = useParams()
  const uniId = params.uniId || params.id // Intenta leer 'uniId' o 'id' por si acaso
  
  console.log("--- DIAGNÓSTICO INICIAL ---")
  console.log("Params recibidos de la URL:", params)
  console.log("uniId extraído:", uniId)
  console.log("UNIVERSIDADES importadas de mockData:", UNIVERSIDADES)

  const [university, setUniversity] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFacultad, setActiveFacultad] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  // 2. BUSCAR LA UNIVERSIDAD
  useEffect(() => {
    console.log("useEffect [1] ejecutándose con uniId:", uniId)
    
    if (!uniId) {
      console.warn("¡Ojo! El uniId está vacío o es undefined.")
      return
    }

    const cleanUniId = uniId.trim().toLowerCase()
    
    // Validamos que UNIVERSIDADES exista y sea un array
    if (!Array.isArray(UNIVERSIDADES)) {
      console.error("UNIVERSIDADES no es un array válido. Revisa mockData.js")
      return
    }

    const uniInfo = UNIVERSIDADES.find(u => u.id?.toLowerCase() === cleanUniId)
    
    if (uniInfo) {
      console.log("Universidad encontrada en mockData:", uniInfo)
      setUniversity(uniInfo)
    } else {
      console.log(`No se encontró '${cleanUniId}' en mockData. Creando fallback seguro.`);
      setUniversity({
        id: cleanUniId,
        name: uniId.toUpperCase(),
        image: '',
        description: 'Proyectos de investigación de esta institución.',
        color: '#64748b',
        textColor: '#FFFFFF'
      })
    }
  }, [uniId])

  // 3. CARGAR PROYECTOS
  useEffect(() => {
    const loadUniProjects = async () => {
      if (!university) {
        console.log("Esperando que 'university' se defina para cargar proyectos...")
        return
      }
      
      console.log("Cargando proyectos para la universidad:", university.name)
      try {
        setLoading(true)
        const data = await fetchAllProjects()
        console.log("Proyectos crudos de la DB:", data)
        
        const currentIdLower = university.id.toLowerCase().trim()
        const currentNameLower = university.name.toLowerCase().trim()
        
        const filteredByUni = (data || []).filter(p => {
          if (!p.universidad) return false
          
          const pUniLower = p.universidad.toLowerCase().trim()
          return (
            pUniLower === currentIdLower || 
            pUniLower === currentNameLower ||
            currentNameLower.includes(pUniLower) ||
            pUniLower.includes(currentIdLower)
          )
        })
        
        console.log("Proyectos que pasaron el filtro:", filteredByUni)
        setProjects(filteredByUni)
      } catch (error) {
        console.error('Error cargando proyectos de la universidad:', error)
        toast.error('Error al obtener proyectos')
      } finally {
        setLoading(false)
      }
    }

    loadUniProjects()
  }, [university])

  // 4. FILTRAR Y ORDENAR
  const processedProjects = projects
    .filter(p => {
      const matchSearch = 
        p.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.resumen?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchFacultad = activeFacultad === 'all' || 
        p.facultad?.toLowerCase() === activeFacultad.toLowerCase() ||
        p.categoria?.toLowerCase() === activeFacultad.toLowerCase()

      return matchSearch && matchFacultad
    })
    .sort((a, b) => {
      if (sortBy === 'likes') return (b.likes_count || 0) - (a.likes_count || 0)
      if (sortBy === 'views') return (b.visitas_count || 0) - (a.visitas_count || 0)
      return new Date(b.created_at || 0) - new Date(a.created_at || 0)
    })

  // Render alternativo en caso de que no haya university cargada
  if (!university) {
    return (
      <div className="uni-page__loading">
        <p>Buscando información de la universidad en la base de datos...</p>
        <p style={{ fontSize: '12px', color: '#888' }}>
          URL param (uniId): {String(uniId)}
        </p>
        <Link to="/" className="btn btn-primary mt-4">Volver al inicio</Link>
      </div>
    )
  }

  return (
    <div className="uni-page page-enter">
      {/* Botón de retorno */}
      <div className="container uni-page__back-container">
        <Link to="/" className="uni-page__back-btn">
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>
      </div>

      {/* Header Banner de la Universidad */}
      <header className="uni-page__header">
        <div className="container uni-page__header-content">
          <div className="uni-page__logo-wrap">
            {university.image ? (
              <img src={university.image} alt={university.name} className="uni-page__logo" />
            ) : (
              <div className="uni-page__logo-fallback" style={{ backgroundColor: university.color }}>
                {university.id.toUpperCase()}
              </div>
            )}
          </div>
          <div className="uni-page__info">
            <span className="uni-page__badge" style={{ backgroundColor: `${university.color}15`, color: university.color }}>
              Proyectos Universitarios
            </span>
            <h1 className="uni-page__title">{university.name}</h1>
            <p className="uni-page__desc">{university.description}</p>
          </div>
        </div>
      </header>

      <div className="container uni-page__body">
        {/* Barra de Filtros Rápidos */}
        <div className="uni-page__toolbar">
          <div className="uni-page__search-bar">
            <Search size={18} className="uni-page__search-icon" />
            <input 
              type="text" 
              placeholder={`Buscar en proyectos de la ${university.id.toUpperCase()}...`} 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="uni-page__search-input"
            />
          </div>

          <div className="uni-page__sort-options">
            <button 
              className={`uni-page__sort-btn ${sortBy === 'recent' ? 'active' : ''}`}
              onClick={() => setSortBy('recent')}
              style={sortBy === 'recent' ? { backgroundColor: university.color, borderColor: university.color } : {}}
            >
              <Clock size={14} /> Recientes
            </button>
            <button 
              className={`uni-page__sort-btn ${sortBy === 'likes' ? 'active' : ''}`}
              onClick={() => setSortBy('likes')}
              style={sortBy === 'likes' ? { backgroundColor: university.color, borderColor: university.color } : {}}
            >
              <Flame size={14} /> Populares
            </button>
            <button 
              className={`uni-page__sort-btn ${sortBy === 'views' ? 'active' : ''}`}
              onClick={() => setSortBy('views')}
              style={sortBy === 'views' ? { backgroundColor: university.color, borderColor: university.color } : {}}
            >
              <Star size={14} /> Más vistos
            </button>
          </div>
        </div>

        <div className="uni-page__layout">
          {/* Sidebar de Facultades */}
          <aside className="uni-page__sidebar">
            <div className="uni-page__sidebar-box">
              <h3 className="uni-page__sidebar-title">
                <BookOpen size={16} /> Facultades
              </h3>
              <div className="uni-page__sidebar-list">
                {FACULTADES.map(fac => (
                  <button
                    key={fac.id}
                    className={`uni-page__sidebar-item ${activeFacultad === fac.id ? 'active' : ''}`}
                    onClick={() => setActiveFacultad(fac.id)}
                    style={activeFacultad === fac.id ? { backgroundColor: `${university.color}10`, color: university.color, fontWeight: '700' } : {}}
                  >
                    {fac.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Grilla de Proyectos */}
          <main className="uni-page__main">
            {loading ? (
              <div className="uni-page__empty-state">
                <p>Cargando proyectos de la institución...</p>
              </div>
            ) : processedProjects.length === 0 ? (
              <div className="uni-page__empty-state">
                <p className="uni-page__empty-emoji">📂</p>
                <h3>No se encontraron proyectos</h3>
                <p>Esta universidad aún no cuenta con proyectos publicados en este filtro.</p>
              </div>
            ) : (
              <div className="uni-page__grid">
                {processedProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}