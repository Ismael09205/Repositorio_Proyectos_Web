import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  UploadCloud, ArrowLeft, GitBranch, GraduationCap, FileText, 
  Link2, CloudUpload, Loader2, CheckCircle2, AlertCircle, X, Image, Info,
  Heart, Eye, MessageSquare, Share2, Trash2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { createProject, fetchProjectById, updateProject, deleteProject } from '../../services/projectService.js'
import { uploadFileToCloudinary } from '../../services/cloudinaryService.js'
import { CATEGORIES_CONFIG } from '../../services/mockData.js'
import './UploadProject.css'

const MAX_FILES = 5
const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export default function UploadProject() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams() 
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditMode) 
  const [uploadingImage, setUploadingImage] = useState(false)
  const [files, setFiles] = useState([])
  const [dropzoneError, setDropzoneError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [deleting, setDeleting] = useState(false)

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
    portada_url: '', 
  })

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (isEditMode) {
      const fetchProjectData = async () => {
        try {
          const project = await fetchProjectById(id)
          
          setFormData({
            titulo: project.titulo || '',
            resumen: project.resumen || '',
            universidad: project.universidad || '',
            facultad: project.facultad || '',
            carrera: project.carrera || '',
            categoria: project.categoria || '',
            archivo_url: project.archivo_url || '',
            archivo_tipo: project.archivo_tipo || '',
            archivo_peso: project.archivo_peso || '',
            github_url: project.github_url || '',
            palabras_clave: project.palabras_clave || '',
            portada_url: project.portada_url || '',
          })

          // CORRECCIÓN: Usamos Array.isArray para evitar que la app explote si archivos no es iterable
          if (project.archivos && Array.isArray(project.archivos) && project.archivos.length > 0) {
            const formattedFiles = project.archivos.map(file => ({
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              name: file.nombre || 'Archivo adjunto',
              size: file.peso ? parseFloat(file.peso) * 1024 * 1024 : 0, // Intenta parsear o por defecto 0
              type: file.tipo || '',
              status: 'done',
              url: file.url,
              error: ''
            }))
            setFiles(formattedFiles)
          }
        } catch (err) {
          setError('No se pudieron cargar los datos del proyecto para editar.')
        } finally {
          setInitialLoading(false)
        }
      }
      fetchProjectData()
    }
  }, [id, isEditMode])

  const activeCategoryInfo = CATEGORIES_CONFIG[formData.categoria] || { 
    code: 'PRJ', 
    color: '#64748b', 
    bg: '#f1f5f9' 
  };

  const getCurrentDateFormatted = () => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date().toLocaleDateString('es-ES', options).replace('.', '');
  }

  const getCategoryCode = (catName) => {
    const config = CATEGORIES_CONFIG[catName]
    return config ? `${config.code}-001` : 'PRJ-001'
  }

  const getPreviewImage = () => {
    if (formData.portada_url) return formData.portada_url
    const firstUploadedImage = files.find(
      (f) => f.status === 'done' && f.type?.startsWith('image/')
    )
    return firstUploadedImage ? firstUploadedImage.url : null
  }

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
    if (['zip', 'rar', '7z'].includes(extension)) return '🗜️'
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) return '🖼️'
    return '📎'
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploadingImage(true)
    try {
      const uploaded = await uploadFileToCloudinary(file)
      setFormData(prev => ({ ...prev, portada_url: uploaded.url }))
    } catch (err) {
      setError('No se pudo subir la imagen de portada.')
    } finally {
      setUploadingImage(false)
    }
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
      notices.push(`Solo se agregaron ${room} de ${incoming.length} archivo(s).`)
    }

    const accepted = []
    toAdd.forEach((file) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        notices.push(`"${file.name}" supera los ${MAX_FILE_SIZE_MB}MB.`)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    const errors = {}
    const completedFiles = files.filter((f) => f.status === 'done')

    if (!formData.titulo.trim()) errors.titulo = 'El título es obligatorio.'
    if (!formData.resumen.trim()) errors.resumen = 'El resumen es obligatorio.'
    if (!formData.categoria.trim()) errors.categoria = 'Selecciona una categoría.'
    if (!formData.universidad.trim()) errors.universidad = 'La universidad es obligatoria.'
    if (!formData.facultad.trim()) errors.facultad = 'La facultad es obligatoria.'
    if (!formData.carrera.trim()) errors.carrera = 'La carrera es obligatoria.'
    if (completedFiles.length === 0) errors.archivos = 'Debes subir al menos un archivo con éxito.'

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      setLoading(false)
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

      const payload = {
        ...trimmedData,
        palabras_clave: formData.palabras_clave,
        archivos: completedFiles.map((f) => ({
          url: f.url,
          tipo: f.type,
          peso: formatFileSize(f.size),
          nombre: f.name,
        })),
      }

      if (isEditMode) {
        await updateProject(token, id, payload)
        setSuccessMsg('¡Proyecto actualizado con éxito!')
      } else {
        await createProject(token, payload)
        setSuccessMsg('¡Proyecto publicado con éxito!')
      }

      setTimeout(() => {
        navigate('/mis-proyectos')
      }, 1500)
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'No se pudo procesar la solicitud.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    if (deleteConfirmationText !== formData.titulo) return

    setDeleting(true)
    setError('')
    try {
      await deleteProject(token, id)
      setSuccessMsg('El proyecto ha sido eliminado permanentemente.')
      setShowDeleteModal(false)
      setTimeout(() => {
        navigate('/mis-proyectos')
      }, 1500)
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'No se pudo eliminar el proyecto.'
      setError(msg)
      setShowDeleteModal(false)
    } finally {
      setDeleting(false)
    }
  }

  const activePreviewImage = getPreviewImage()

  if (initialLoading) {
    return (
      <div className="upload-project-loading">
        <Loader2 size={40} className="animate-spin" />
        <p>Cargando datos del proyecto...</p>
      </div>
    )
  }

  return (
    <div className="upload-project-page page-enter container">
      <button 
        type="button" 
        className="btn btn-outline back-button" 
        onClick={() => navigate('/mis-proyectos')}
      >
        <ArrowLeft size={16} /> Volver a mis proyectos
      </button>

      <header className="upload-header">
        <h1 className="upload-title">{isEditMode ? 'Editar tu proyecto' : 'Publicar nuevo proyecto'}</h1>
        <p className="upload-subtitle">
          {isEditMode 
            ? 'Modifica los campos necesarios para mantener actualizada tu propuesta académica en la comunidad.' 
            : 'Llena la información detallada para compartir tu propuesta académica con la comunidad de IdeAgora.'}
        </p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="upload-workspace">
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <form className="my-projects__form" onSubmit={handleSubmit}>
          
          {/* Sección 1: Información básica */}
          <div className="my-projects__form-section">
            <h3 className="my-projects__form-section-title"><GitBranch size={14} /> Información del proyecto</h3>
            <div className="my-projects__form-grid">
              <label>
                Título del proyecto
                <input 
                  value={formData.titulo} 
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} 
                  placeholder="Ej. Tuberias de agua potable recicladas"
                />
                {fieldErrors.titulo && <span className="my-projects__field-error">{fieldErrors.titulo}</span>}
              </label>
              
              <label>
                Categoría
                <select 
                  value={formData.categoria} 
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  <option value="">Selecciona una categoría</option>
                  {Object.keys(CATEGORIES_CONFIG).map((catName) => (
                    <option key={catName} value={catName}>
                      {catName}
                    </option>
                  ))}
                </select>
                {fieldErrors.categoria && <span className="my-projects__field-error">{fieldErrors.categoria}</span>}
              </label>

              <label className="my-projects__fullwidth">
                Resumen del proyecto
                <textarea 
                  value={formData.resumen} 
                  onChange={(e) => setFormData({ ...formData, resumen: e.target.value })} 
                  rows={4} 
                  placeholder="Describe brevemente de qué trata el proyecto..."
                />
                {fieldErrors.resumen && <span className="my-projects__field-error">{fieldErrors.resumen}</span>}
              </label>
            </div>
          </div>

          {/* Imagen de Portada */}
          <div className="my-projects__form-section">
            <h3 className="my-projects__form-section-title" style={{ '--section-accent': '#1e40af' }}>
              <Image size={14} /> Imagen del Proyecto
            </h3>
            
            <div className="ideagora-warning-box">
              <Info size={18} className="warning-icon" />
              <div className="warning-content">
                <strong>¿Quieres destacar en la comunidad?</strong>
                <p>Para una mejor presentación en los feeds y búsquedas, te recomendamos subir una imagen representativa de tu proyecto.</p>
              </div>
            </div>

            <div className="image-upload-control">
              <div className="image-upload-btn-wrapper">
                <button type="button" className="btn btn-outline upload-img-trigger">
                  {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Image size={16} />}
                  {formData.portada_url ? 'Cambiar Imagen' : 'Subir Imagen de Portada'}
                </button>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploadingImage}
                />
              </div>
              {formData.portada_url && (
                <button 
                  type="button" 
                  className="btn-remove-image" 
                  onClick={() => setFormData(prev => ({ ...prev, portada_url: '' }))}
                >
                  Quitar imagen
                </button>
              )}
            </div>
          </div>

          {/* Sección 2: Procedencia académica */}
          <div className="my-projects__form-section">
            <h3 className="my-projects__form-section-title"><GraduationCap size={14} /> Procedencia académica</h3>
            <div className="my-projects__form-grid my-projects__form-grid--trio">
              <label>
                Universidad
                <input value={formData.universidad} onChange={(e) => setFormData({ ...formData, universidad: e.target.value })} placeholder="Ej. UTA o EPN" />
                {fieldErrors.universidad && <span className="my-projects__field-error">{fieldErrors.universidad}</span>}
              </label>
              <label>
                Facultad
                <input value={formData.facultad} onChange={(e) => setFormData({ ...formData, facultad: e.target.value })} placeholder="Ej. Sistemas" />
                {fieldErrors.facultad && <span className="my-projects__field-error">{fieldErrors.facultad}</span>}
              </label>
              <label>
                Carrera
                <input value={formData.carrera} onChange={(e) => setFormData({ ...formData, carrera: e.target.value })} placeholder="Ej. Computación" />
                {fieldErrors.carrera && <span className="my-projects__field-error">{fieldErrors.carrera}</span>}
              </label>
            </div>
          </div>

          {/* Sección 3: Archivos */}
          <div className="my-projects__form-section">
            <h3 className="my-projects__form-section-title"><FileText size={14} /> Archivos del proyecto</h3>
            <div
              className={`my-projects__dropzone ${dropzoneFull ? 'is-disabled' : ''}`}
              onDrop={dropzoneFull ? undefined : handleDrop}
              onDragOver={dropzoneFull ? undefined : handleDragOver}
            >
              <div className="my-projects__dropzone-icon"><CloudUpload size={22} /></div>
              <p>{dropzoneFull ? 'Límite alcanzado.' : 'Arrastra tus archivos aquí o haz clic.'}</p>
              <input
                type="file"
                multiple
                className="my-projects__file-input"
                onChange={handleFileInput}
                disabled={dropzoneFull}
                accept=".pdf,.doc,.docx,.txt,.zip,.rar,.7z,.ppt,.pptx,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp"
              />
            </div>
            
            {fieldErrors.archivos && <div className="my-projects__dropzone-error"><AlertCircle size={15} /> {fieldErrors.archivos}</div>}
            {dropzoneError && <div className="my-projects__dropzone-error"><AlertCircle size={15} /> {dropzoneError}</div>}

            {files.length > 0 && (
              <ul className="my-projects__file-list">
                {files.map((f) => (
                  <li key={f.id} className={`my-projects__file-item ${f.status === 'error' ? 'my-projects__file-item--error' : ''} ${f.status === 'done' ? 'my-projects__file-item--done' : ''}`}>
                    <div className="my-projects__file-item-icon">{getFileIcon(f.name)}</div>
                    <div className="my-projects__file-item-info">
                      <span className="my-projects__file-item-name">{f.name}</span>
                      <p className="my-projects__file-item-meta">{formatFileSize(f.size)}</p>
                    </div>
                    <button type="button" className="my-projects__file-item-remove" onClick={() => removeFile(f.id)}><X size={15} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Sección 4: Enlaces */}
          <div className="my-projects__form-section">
            <h3 className="my-projects__form-section-title"><Link2 size={14} /> Enlaces y palabras clave</h3>
            <div className="my-projects__form-grid">
              <label>
                Repositorio GitHub
                <input value={formData.github_url} onChange={(e) => setFormData({ ...formData, github_url: e.target.value })} placeholder="https://github.com/..." />
              </label>
              <label>
                Palabras clave
                <input value={formData.palabras_clave} onChange={(e) => setFormData({ ...formData, palabras_clave: e.target.value })} placeholder="IA, React, Python" />
              </label>
            </div>
          </div>

          {/* Footer de Acciones del Formulario */}
          <div className="form-actions-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {/* BOTÓN DE ELIMINAR PROYECTO */}
              {isEditMode && (
                <button 
                  type="button" 
                  className="btn btn-delete-action"
                  onClick={() => setShowDeleteModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', border: '1px solid #fee2e2', backgroundColor: '#fef2f2', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                >
                  <Trash2 size={16} /> Eliminar Proyecto
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/mis-proyectos')}>Cancelar</button>
              <button 
                type="submit" 
                className="btn btn-primary btn-submit-main" 
                disabled={isUploadingAnyFile || !hasCompletedFile || loading}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : isEditMode ? 'Guardar cambios' : 'Publicar proyecto'}
              </button>
            </div>
          </div>
        </form>

        {/* COLUMNA DERECHA: LIVE PREVIEW CARD */}
        <aside className="preview-sidebar">
          <div className="preview-sticky-container">
            <div className="preview-badge">VISTA PREVIA EN TIEMPO REAL</div>
            
            <div 
              className="ideagora-live-card"
              style={{ 
                borderTop: `4px solid ${activeCategoryInfo.color}` 
              }}
            >
              <div className="card-top-punch-holes">
                <span></span>
                <span></span>
              </div>

              <div className="card-image-wrapper">
                {activePreviewImage ? (
                  <img src={activePreviewImage} alt="Portada" className="card-img" />
                ) : (
                  <div className="card-img-placeholder">
                    <Image size={32} />
                    <span>Sin imagen</span>
                  </div>
                )}
                
                <span 
                  className="card-category-badge-top-right"
                  style={{ 
                    backgroundColor: activeCategoryInfo.bg, 
                    color: activeCategoryInfo.color,
                    borderColor: `${activeCategoryInfo.color}30` 
                  }}
                >
                  {getCategoryCode(formData.categoria)}
                </span>
              </div>

              <div className="card-body">
                <div className="card-university-wrapper">
                  <span 
                    className="card-university-pill"
                    style={{
                      backgroundColor: activeCategoryInfo.color,
                      color: '#ffffff'
                    }}
                  >
                    {formData.universidad ? formData.universidad.toUpperCase() : ' '}
                  </span>
                </div>

                <h3 className="card-title-preview">
                  {formData.titulo || 'Título del proyecto'}
                </h3>
                
                <p className="card-summary-preview">
                  {formData.resumen || 'Describe de qué trata tu proyecto...'}
                </p>

                <div className="card-metadata">
                  <div className="meta-author">
                    <div className="author-avatar">
                      {user?.profile?.avatar_url ? (
                        <img src={user.profile.avatar_url} alt="Avatar" />
                      ) : (
                        <span>{user?.username?.substring(0, 2).toUpperCase() || 'EC'}</span>
                      )}
                    </div>
                    <span className="author-name">
                      {user?.profile?.nombre_completo || user?.username || 'Autor'}
                    </span>
                    <span className="metadata-separator">•</span>
                    <span className="metadata-date">{getCurrentDateFormatted()}</span>
                  </div>
                </div>

                <div className="card-interactions-footer">
                  <div className="interaction-items">
                    <span className="interaction-item"><Heart size={16} /> 0</span>
                    <span className="interaction-item"><Eye size={16} /> 0</span>
                    <span className="interaction-item"><MessageSquare size={16} /> 0</span>
                  </div>
                  <button type="button" className="interaction-share-btn">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* MODAL DE SEGURIDAD PARA ELIMINAR PROYECTO */}
      {showDeleteModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="modal-container" style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '24px', position: 'relative' }}>
            <button 
              type="button" 
              className="modal-close-btn" 
              onClick={() => { setShowDeleteModal(false); setDeleteConfirmationText(''); }}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
              <div style={{ margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fee2e2', color: '#ef4444', width: '48px', height: '48px', borderRadius: '50%' }}>
                <Trash2 size={24} />
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>¿Eliminar este proyecto de forma permanente?</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                  Esta acción no se puede deshacer. Se borrarán todos los archivos adjuntos en Cloudinary y la información asociada a este proyecto.
                </p>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#334155', textAlign: 'left' }}>
                Para confirmar, escribe el nombre exacto del proyecto a continuación: <br />
                <strong style={{ color: '#0f172a', wordBreak: 'break-all' }}>{formData.titulo}</strong>
              </div>

              <input 
                type="text" 
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Escribe el nombre del proyecto aquí"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              />

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmationText(''); }}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', background: '#fff', fontWeight: '500' }}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  disabled={deleteConfirmationText !== formData.titulo || deleting}
                  onClick={handleDeleteProject}
                  style={{ 
                    flex: 1, 
                    padding: '10px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    cursor: deleteConfirmationText === formData.titulo && !deleting ? 'pointer' : 'not-allowed', 
                    background: deleteConfirmationText === formData.titulo ? '#ef4444' : '#fca5a5', 
                    color: '#fff', 
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}