import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus, Search, UploadCloud, X, CloudUpload, FileText, Download,
  GitBranch, GraduationCap, Link2, Folder, FolderOpen, Clock, Heart, Eye,
} from 'lucide-react'
import ProjectCard from '../../components/ProjectCard/ProjectCard'
import { useAuth } from '../../context/AuthContext'
import { fetchMyProjects, createProject } from '../../services/projectService.js'
import { uploadFileToCloudinary } from '../../services/cloudinaryService.js'
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

export default function MyProjects() {
  const { user, token } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('categoria') || 'Todas')
  const [sort, setSort] = useState(searchParams.get('sort') || 'recent')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [formData, setFormData] = useState({
    titulo: '',
    resumen: '',
    universidad: '',
    facultad: '',
    carrera: '',
    categoria: '',
    archivo_url: '',
    archivo_tipo: '',
    archivo_peso: '',
    github_url: '',
    palabras_clave: '',
  })
  const [error, setError] = useState('')
  const [pageError, setPageError] = useState('')
  const [message, setMessage] = useState('')

  const activeCategory = category
  const activeQuery = query.trim()

  const filterLabel = useMemo(() => {
    return activeCategory === 'Todas' ? 'Todas las categorías' : activeCategory
  }, [activeCategory])

  const formatFileSize = (size) => {
    if (!size) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    let value = size
    let index = 0
    while (value >= 1024 && index < units.length - 1) {
      value /= 1024
      index += 1
    }
    return `${value.toFixed(1)} ${units[index]}`
  }

  const getFileIcon = (name) => {
    const extension = name?.split('.').pop()?.toLowerCase() || ''
    if (['pdf'].includes(extension)) return '📄'
    if (['doc', 'docx', 'odt'].includes(extension)) return '📝'
    if (['txt'].includes(extension)) return '📄'
    if (['zip', 'rar', '7z'].includes(extension)) return '🗜️'
    if (['ppt', 'pptx'].includes(extension)) return '📊'
    if (['xls', 'xlsx', 'csv'].includes(extension)) return '📈'
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) return '🖼️'
    return '📎'
  }

  const uploadFile = async (file) => {
    if (!file) return
    setError('')
    setUploadingFile(true)
    try {
      const uploaded = await uploadFileToCloudinary(file)
      setUploadedFile(uploaded)
      setFormData({
        ...formData,
        archivo_url: uploaded.url,
        archivo_tipo: uploaded.type || file.type,
        archivo_peso: formatFileSize(uploaded.size || file.size),
      })
    } catch (uploadError) {
      setError(uploadError.message || 'Error subiendo el archivo.')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleFileInput = async (event) => {
    const file = event.target.files?.[0]
    if (file) {
      await uploadFile(file)
    }
  }

  const handleDrop = async (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      await uploadFile(file)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const resetProjectForm = () => {
    setFormData({
      titulo: '',
      resumen: '',
      universidad: '',
      facultad: '',
      carrera: '',
      categoria: '',
      archivo_url: '',
      archivo_tipo: '',
      archivo_peso: '',
      github_url: '',
      palabras_clave: '',
    })
    setUploadedFile(null)
    setError('')
    setUploadingFile(false)
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      const trimmedData = {
        ...formData,
        titulo: formData.titulo.trim(),
        resumen: formData.resumen.trim(),
        universidad: formData.universidad.trim(),
        facultad: formData.facultad.trim(),
        carrera: formData.carrera.trim(),
        categoria: formData.categoria.trim(),
        archivo_url: formData.archivo_url.trim(),
        archivo_tipo: formData.archivo_tipo.trim(),
        archivo_peso: formData.archivo_peso.trim(),
        github_url: formData.github_url.trim(),
      }

      const newProject = await createProject(token, {
        ...trimmedData,
        palabras_clave: formData.palabras_clave,
      })

      setProjects((prev) => [newProject, ...prev])
      setMessage('Proyecto subido con éxito. Ahora puedes verlo en tu lista.')
      setFormOpen(false)
      resetProjectForm()
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'No se pudo crear el proyecto.'
      setError(msg)
    }
  }

  return (
    <div className="my-projects page-enter">
      <div className="my-projects__header container">
        <div className="my-projects__heading">
          <div className="my-projects__eyebrow-row">
            <span className="my-projects__eyebrow-icon"><Folder size={14} /></span>
            <p className="eyebrow">Mis proyectos</p>
          </div>
          <h1 className='my-projects__title'>Administración de tus publicaciones</h1>
          <p className="my-projects__subtitle">Aquí verás todos tus proyectos subidos. Puedes filtrar por categoría, buscar por título o tecnología, y crear un nuevo proyecto con métricas de likes, visitas y comentarios.</p>
        </div>

        <button className="btn btn-primary my-projects__upload-btn" onClick={() => { resetProjectForm(); setFormOpen(true) }}>
          <UploadCloud size={18} /> Subir nuevo proyecto
        </button>
      </div>

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
          {query && <button type="button" onClick={() => setQuery('')}><X size={16} /></button>}
        </div>

        <div className="my-projects__filter-row">
          <div className="my-projects__chip-row" role="group" aria-label="Filtrar por categoría" title={filterLabel}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`my-projects__chip ${category === cat ? 'is-active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="my-projects__segmented" role="group" aria-label="Ordenar por">
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
      </div>

      <div className="my-projects__summary container">
        <div className="my-projects__summary-line">
          <Folder size={15} />
          <span><strong>{projects.length}</strong> proyecto{projects.length === 1 ? '' : 's'}</span>
          <span className="my-projects__summary-divider">·</span>
          <span className="my-projects__summary-tag">categoria:{activeCategory === 'Todas' ? 'todas' : activeCategory.toLowerCase().replace(/\s+/g, '-')}</span>
          <span className="my-projects__summary-divider">·</span>
          <span className="my-projects__summary-tag">orden:{sort}</span>
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
            <div className="my-projects__empty-icon"><FolderOpen size={28} /></div>
            <h2>No tienes proyectos aún</h2>
            <p>Publica tu primer proyecto para que otros estudiantes puedan verlo, darle like y comentarlo.</p>
            <button className="btn btn-primary" onClick={() => { resetProjectForm(); setFormOpen(true) }}>
              <Plus size={16} /> Subir mi primer proyecto
            </button>
          </div>
        ) : (
          <div className="my-projects__grid">
            {projects.map((project) => (
              <div key={project.id} className="my-projects__card-wrapper">
                <ProjectCard project={{
                  id: project.id,
                  title: project.titulo,
                  category: project.categoria,
                  categoryId: project.categoria.toLowerCase().replace(/ /g, ''),
                  author: user?.profile?.nombre_usuario || 'Tú',
                  university: project.universidad,
                  likes: project.likes_count || 0,
                  favorites: project.likes_count || 0,
                  views: project.visitas_count || 0,
                  comments: project.comments_count || 0,
                  description: project.resumen,
                }} variant="expanded" />
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <div className="my-projects__modal">
          <div className="my-projects__modal-content container">
            <div className="my-projects__modal-header">
              <div>
                <h2>Subir nuevo proyecto</h2>
                <p>Llena los datos del proyecto y publícalo en tu portafolio.</p>
              </div>
              <button className="my-projects__close-btn" onClick={() => { setFormOpen(false); resetProjectForm() }}><X size={20} /></button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <form className="my-projects__form" onSubmit={handleSubmit}>
              <div className="my-projects__form-section">
                <h3 className="my-projects__form-section-title"><GitBranch size={15} /> Información del proyecto</h3>
                <div className="my-projects__form-grid">
                  <label>
                    Título del proyecto
                    <input value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} />
                  </label>
                  <label>
                    Categoría
                    <select value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}>
                      <option value="">Selecciona una categoría</option>
                      {CATEGORIES.filter((cat) => cat !== 'Todas').map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </label>
                  <label className="my-projects__fullwidth">
                    Resumen del proyecto
                    <textarea value={formData.resumen} onChange={(e) => setFormData({ ...formData, resumen: e.target.value })} rows={5} />
                  </label>
                </div>
              </div>

              <div className="my-projects__form-section">
                <h3 className="my-projects__form-section-title"><GraduationCap size={15} /> Procedencia académica</h3>
                <div className="my-projects__form-grid my-projects__form-grid--trio">
                  <label>
                    Universidad
                    <input value={formData.universidad} onChange={(e) => setFormData({ ...formData, universidad: e.target.value })} />
                  </label>
                  <label>
                    Facultad
                    <input value={formData.facultad} onChange={(e) => setFormData({ ...formData, facultad: e.target.value })} />
                  </label>
                  <label>
                    Carrera
                    <input value={formData.carrera} onChange={(e) => setFormData({ ...formData, carrera: e.target.value })} />
                  </label>
                </div>
              </div>

              <div className="my-projects__form-section">
                <h3 className="my-projects__form-section-title"><FileText size={15} /> Archivo del proyecto</h3>
                <div
                  className="my-projects__dropzone"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="my-projects__dropzone-icon"><CloudUpload size={24} /></div>
                  <p>{uploadingFile ? 'Subiendo archivo...' : 'Arrastra y suelta el archivo aquí, o haz clic para seleccionar.'}</p>
                  <div className="my-projects__dropzone-formats">
                    {['PDF', 'DOCX', 'PPTX', 'XLSX', 'ZIP', 'PNG', 'JPG'].map((f) => (
                      <span key={f} className="my-projects__format-chip">{f}</span>
                    ))}
                  </div>
                  <input
                    type="file"
                    className="my-projects__file-input"
                    onChange={handleFileInput}
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar,.7z,.ppt,.pptx,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp"
                  />
                </div>

                {uploadedFile && (
                  <div className="my-projects__file-preview">
                    <div className="my-projects__file-preview-icon">{getFileIcon(uploadedFile.name)}</div>
                    <div className="my-projects__file-preview-info">
                      <strong>{uploadedFile.name}</strong>
                      <p className="my-projects__file-preview-meta">{uploadedFile.type} · {uploadedFile.size ? formatFileSize(uploadedFile.size) : formData.archivo_peso}</p>
                    </div>
                    <a className="my-projects__file-download" href={uploadedFile.url} target="_blank" rel="noreferrer">
                      <Download size={16} /> Descargar
                    </a>
                  </div>
                )}
              </div>

              <div className="my-projects__form-section">
                <h3 className="my-projects__form-section-title"><Link2 size={15} /> Enlaces y palabras clave</h3>
                <div className="my-projects__form-grid">
                  <label>
                    Repositorio GitHub
                    <input value={formData.github_url} onChange={(e) => setFormData({ ...formData, github_url: e.target.value })} placeholder="https://github.com/..." />
                  </label>
                  <label>
                    Palabras clave (separadas por comas)
                    <input value={formData.palabras_clave} onChange={(e) => setFormData({ ...formData, palabras_clave: e.target.value })} placeholder="IA, React, Python" />
                  </label>
                </div>
              </div>

              <div className="my-projects__modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setFormOpen(false); resetProjectForm() }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={uploadingFile || !uploadedFile}>
                  {uploadingFile ? 'Subiendo...' : 'Publicar proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}