import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus, Search, UploadCloud, X, CloudUpload, FileText,
  GitBranch, GraduationCap, Link2, Folder, FolderOpen, Clock, Heart, Eye,
  Loader2, CheckCircle2, AlertCircle,
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

const MAX_FILES = 5
const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export default function MyProjects() {
  const { user, token } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('categoria') || 'Todas')
  const [sort, setSort] = useState(searchParams.get('sort') || 'recent')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [files, setFiles] = useState([])
  const [dropzoneError, setDropzoneError] = useState('')
  
  // ¡CORREGIDO!: El estado de errores de los campos ahora vive dentro del componente
  const [fieldErrors, setFieldErrors] = useState({})
  
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

  const uploadEntry = async (entry) => {
    try {
      const uploaded = await uploadFileToCloudinary(entry.file)
      setFiles((prev) => prev.map((f) => (
        f.id === entry.id
          ? { ...f, status: 'done', url: uploaded.url, type: uploaded.type || entry.type, size: uploaded.size || entry.size }
          : f
      )))
    } catch (uploadError) {
      setFiles((prev) => prev.map((f) => (
        f.id === entry.id
          ? { ...f, status: 'error', error: uploadError.message || 'Error subiendo el archivo.' }
          : f
      )))
    }
  }

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || [])
    if (!incoming.length) return

    setDropzoneError('')
    const room = MAX_FILES - files.length

    if (room <= 0) {
      setDropzoneError(`Ya alcanzaste el máximo de ${MAX_FILES} archivos.`)
      return
    }

    const toAdd = incoming.slice(0, room)
    const notices = []

    if (incoming.length > room) {
      notices.push(`Solo se agregaron ${room} de ${incoming.length} archivo(s): máximo ${MAX_FILES}.`)
    }

    const accepted = []
    toAdd.forEach((file) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        notices.push(`"${file.name}" supera los ${MAX_FILE_SIZE_MB}MB y no se agregó.`)
      } else {
        accepted.push(file)
      }
    })

    if (notices.length) setDropzoneError(notices.join(' '))
    if (!accepted.length) return

    const newEntries = accepted.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      url: '',
      error: '',
    }))

    setFiles((prev) => [...prev, ...newEntries])
    newEntries.forEach((entry) => uploadEntry(entry))
  }

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleFileInput = (event) => {
    addFiles(event.target.files)
    event.target.value = ''
  }

  const handleDrop = (event) => {
    event.preventDefault()
    addFiles(event.dataTransfer.files)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const isUploadingAnyFile = files.some((f) => f.status === 'uploading')
  const hasCompletedFile = files.some((f) => f.status === 'done')
  const dropzoneFull = files.length >= MAX_FILES

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
    setFiles([])
    setDropzoneError('')
    setError('')
    setFieldErrors({}) // Limpiamos errores de validación al resetear
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

  // ¡CORREGIDO!: Validación robusta, control preventDefault y orden de variables
  const handleSubmit = async (e) => {
    e.preventDefault() // Evitamos la recarga del navegador inmediatamente
    setError('')
    setMessage('')

    const errors = {}
    const completedFiles = files.filter((f) => f.status === 'done')

    if (!formData.titulo.trim()) {
      errors.titulo = 'El título es obligatorio.'
    }
    if (!formData.resumen.trim()) {
      errors.resumen = 'El resumen es obligatorio.'
    }
    if (!formData.categoria.trim()) {
      errors.categoria = 'Selecciona una categoría.'
    }
    if (!formData.universidad.trim()) {
      errors.universidad = 'La universidad es obligatoria.'
    }
    if (!formData.facultad.trim()) {
      errors.facultad = 'La facultad es obligatoria.'
    }
    if (!formData.carrera.trim()) {
      errors.carrera = 'La carrera es obligatoria.'
    }
    if (completedFiles.length === 0) {
      errors.archivos = 'Debes subir al menos un archivo con éxito.'
    }

    setFieldErrors(errors)

    // Detener flujo si hay errores
    if (Object.keys(errors).length > 0) {
      return
    }

    const primary = completedFiles[0]

    try {
      const trimmedData = {
        ...formData,
        titulo: formData.titulo.trim(),
        resumen: formData.resumen.trim(),
        universidad: formData.universidad.trim(),
        facultad: formData.facultad.trim(),
        carrera: formData.carrera.trim(),
        categoria: formData.categoria.trim(),
        archivo_url: primary?.url || '',
        archivo_tipo: primary?.type || '',
        archivo_peso: primary ? formatFileSize(primary.size) : '',
        github_url: formData.github_url.trim(),
      }

      const newProject = await createProject(token, {
        ...trimmedData,
        palabras_clave: formData.palabras_clave,
        archivos: completedFiles.map((f) => ({
          url: f.url,
          tipo: f.type,
          peso: formatFileSize(f.size),
          nombre: f.name,
        })),
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
          onClick={() => { resetProjectForm(); setFormOpen(true) }}
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
            <button className="btn btn-primary" onClick={() => { resetProjectForm(); setFormOpen(true) }}>
              <Plus size={16} /> Subir mi primer proyecto
            </button>
          </div>
        ) : (
          <div className="my-projects__grid">
            {projects.map((project, index) => {
              const accent = getCategoryAccent(project.categoria)
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
              )
            })}
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
              <button className="my-projects__close-btn" onClick={() => { setFormOpen(false); resetProjectForm() }} aria-label="Cerrar"><X size={20} /></button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <form className="my-projects__form" onSubmit={handleSubmit}>
              <div className="my-projects__form-section">
                <h3 className="my-projects__form-section-title"><GitBranch size={14} /> Información del proyecto</h3>
                <div className="my-projects__form-grid">
                  <label>
                    Título del proyecto
                    <input value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} />
                    {fieldErrors.titulo && (
                      <span className="my-projects__field-error">{fieldErrors.titulo}</span>
                    )}
                  </label>
                  <label>
                    Categoría
                    <select value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}>
                      <option value="">Selecciona una categoría</option>
                      {CATEGORIES.filter((cat) => cat !== 'Todas').map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    {fieldErrors.categoria && (
                      <span className="my-projects__field-error">{fieldErrors.categoria}</span>
                    )}
                  </label>
                  <label className="my-projects__fullwidth">
                    Resumen del proyecto
                    <textarea value={formData.resumen} onChange={(e) => setFormData({ ...formData, resumen: e.target.value })} rows={5} />
                    {fieldErrors.resumen && (
                      <span className="my-projects__field-error">{fieldErrors.resumen}</span>
                    )}
                  </label>
                </div>
              </div>

              <div className="my-projects__form-section">
                <h3 className="my-projects__form-section-title"><GraduationCap size={14} /> Procedencia académica</h3>
                <div className="my-projects__form-grid my-projects__form-grid--trio">
                  <label>
                    Universidad
                    <input value={formData.universidad} onChange={(e) => setFormData({ ...formData, universidad: e.target.value })} />
                    {fieldErrors.universidad && (
                      <span className="my-projects__field-error">{fieldErrors.universidad}</span>
                    )}
                  </label>
                  <label>
                    Facultad
                    <input value={formData.facultad} onChange={(e) => setFormData({ ...formData, facultad: e.target.value })} />
                    {fieldErrors.facultad && (
                      <span className="my-projects__field-error">{fieldErrors.facultad}</span>
                    )}
                  </label>
                  <label>
                    Carrera
                    <input value={formData.carrera} onChange={(e) => setFormData({ ...formData, carrera: e.target.value })} />
                    {fieldErrors.carrera && (
                      <span className="my-projects__field-error">{fieldErrors.carrera}</span>
                    )}
                  </label>
                </div>
              </div>

              <div className="my-projects__form-section">
                <h3 className="my-projects__form-section-title"><FileText size={14} /> Archivos del proyecto</h3>
                <div
                  className={`my-projects__dropzone ${dropzoneFull ? 'is-disabled' : ''}`}
                  onDrop={dropzoneFull ? undefined : handleDrop}
                  onDragOver={dropzoneFull ? undefined : handleDragOver}
                >
                  <div className="my-projects__dropzone-icon"><CloudUpload size={22} /></div>
                  <p>
                    {dropzoneFull
                      ? `Alcanzaste el máximo de ${MAX_FILES} archivos.`
                      : 'Arrastra y suelta tus archivos aquí, o haz clic para seleccionar.'}
                  </p>
                  <div className="my-projects__dropzone-formats">
                    {['PDF', 'DOCX', 'PPTX', 'XLSX', 'ZIP', 'PNG', 'JPG'].map((f) => (
                      <span key={f} className="my-projects__format-chip">{f}</span>
                    ))}
                  </div>
                  <p className="my-projects__dropzone-hint">
                    Máximo {MAX_FILES} archivos · {MAX_FILE_SIZE_MB}MB por archivo · {files.length}/{MAX_FILES} agregados
                  </p>
                  {!dropzoneFull && (
                    <input
                      type="file"
                      multiple
                      className="my-projects__file-input"
                      onChange={handleFileInput}
                      accept=".pdf,.doc,.docx,.txt,.zip,.rar,.7z,.ppt,.pptx,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp"
                    />
                  )}
                </div>

                {fieldErrors.archivos && (
                  <div className="my-projects__dropzone-error" style={{ marginTop: '0.5rem' }}>
                    <AlertCircle size={15} /> {fieldErrors.archivos}
                  </div>
                )}

                {dropzoneError && (
                  <div className="my-projects__dropzone-error">
                    <AlertCircle size={15} /> {dropzoneError}
                  </div>
                )}

                {files.length > 0 && (
                  <ul className="my-projects__file-list">
                    {files.map((f) => (
                      <li
                        key={f.id}
                        className={`my-projects__file-item ${f.status === 'error' ? 'my-projects__file-item--error' : ''} ${f.status === 'done' ? 'my-projects__file-item--done' : ''}`}
                      >
                        <div className="my-projects__file-item-icon">{getFileIcon(f.name)}</div>
                        <div className="my-projects__file-item-info">
                          <span className="my-projects__file-item-name">{f.name}</span>
                          <p className={`my-projects__file-item-meta ${f.status === 'error' ? 'is-error' : ''}`}>
                            {f.status === 'error' ? f.error : formatFileSize(f.size)}
                          </p>
                        </div>
                        <span className={`my-projects__file-item-status is-${f.status}`} aria-label={f.status}>
                          {f.status === 'uploading' && <Loader2 size={16} />}
                          {f.status === 'done' && <CheckCircle2 size={16} />}
                          {f.status === 'error' && <AlertCircle size={16} />}
                        </span>
                        <button
                          type="button"
                          className="my-projects__file-item-remove"
                          onClick={() => removeFile(f.id)}
                          aria-label={`Quitar ${f.name}`}
                        >
                          <X size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="my-projects__form-section">
                <h3 className="my-projects__form-section-title"><Link2 size={14} /> Enlaces y palabras clave</h3>
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
                <button type="submit" className="btn btn-primary" disabled={isUploadingAnyFile || !hasCompletedFile}>
                  {isUploadingAnyFile ? 'Subiendo archivos...' : 'Publicar proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}