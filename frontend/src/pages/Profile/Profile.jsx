import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../services/apiConfig.js'
import { useAuth } from '../../context/AuthContext';
import { uploadFileToCloudinary } from '../../services/cloudinaryService.js';
import { updateProfile as updateProfileRequest } from '../../services/authService.js';
import { fetchMiInsignia } from '../../services/adminService.js';
import InsigniaBadge from '../../components/InsigniaBadge/InsigniaBadge.jsx';
import './Profile.css';
import {
  User,
  GraduationCap,
  Compass,
  AlertCircle,
  Edit2,
  LogOut,
  Save,
  X,
  CheckCircle,
  Shield,
  Users,
  Pencil,
  MapPin,
  Mail,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Estados para la edición e interactividad del formulario
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [interestInput, setInterestInput] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Estado para la insignia del estudiante
  const [insigniaDatos, setInsigniaDatos] = useState(null);

  // Estados para el avatar
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const authToken = token || localStorage.getItem('pc_token');
        if (!authToken) {
          setError('Inicia sesión en IdeaAgora para acceder a tu perfil.');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        const profileData = response.data;

        setProfile(profileData);
        setFormData({
          ...profileData,
          intereses: Array.isArray(profileData.intereses)
            ? profileData.intereses
            : typeof profileData.intereses === 'string'
              ? profileData.intereses.split(/\s+/).filter(Boolean)
              : []
        });
        setInterestInput('');

        // Evitar el error 403 en consola si el rol en el token/perfil no es 'admin'
        // NOTA: Si tu backend devuelve el rol en profileData, lo ideal es verificarlo directamente:
        const userRole = profileData.rol || profileData.role; 
        
        if (userRole === 'admin') {
          setIsAdmin(true);
        } else {
          // Si no tienes el rol directamente en la respuesta del perfil, hacemos la consulta silenciosa 
          // pero solo si realmente es necesario. Si falla, simplemente marcamos como false sin alarmar.
          try {
            const adminCheck = await axios.get(`${API_BASE_URL}/api/authLogs/statistics`, {
              headers: { Authorization: `Bearer ${authToken}` }
            });
            if (adminCheck.status === 200) {
              setIsAdmin(true);
            }
          } catch (adminErr) {
            setIsAdmin(false);
          }
        }

        // Cargamos la insignia solo si es estudiante (rol != 'administrador')
        if (userRole !== 'administrador' && userRole !== 'admin') {
          try {
            const datosInsignia = await fetchMiInsignia(authToken);
            setInsigniaDatos(datosInsignia);
          } catch {
            // Si falla la carga de insignia no bloqueamos el perfil
            setInsigniaDatos(null);
          }
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error al conectar con IdeAgora.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [token]);

  // Enviar las actualizaciones del formulario al Backend
  async function handleSaveChanges(e) {
    e.preventDefault();

    const nombreCompleto = isAdmin ? formData.name : formData.nombre_completo;
    
    if (!nombreCompleto || nombreCompleto.trim() === '') {
      alert('El nombre completo es requerido. Por favor verifica que el campo esté lleno.');
      return;
    }

    try {
      setUpdateLoading(true);
      setSuccessMessage("");

      const authToken = token || localStorage.getItem('pc_token');

      if (!authToken) {
        alert('Inicia sesión nuevamente para actualizar tu perfil.');
        return;
      }

      const response = await axios.put(`${API_BASE_URL}/api/users/profile`, formData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      setProfile(response.data);
      setIsEditing(false);
      setSuccessMessage("¡Tus datos se actualizaron correctamente!");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Ocurrió un error al intentar guardar los cambios.");
    } finally {
      setUpdateLoading(false);
    }
  }

  // Cerrar la sesión
  async function handleLogout() {
    const confirmar = window.confirm("¿Seguro que deseas cerrar sesión en IdeAgora?");
    if (confirmar) {
      logout();
      window.location.href = '/';
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleInterestInputChange = (e) => {
    setInterestInput(e.target.value);
  };

  const handleInterestInputKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const value = interestInput.trim();
    if (!value) return;
    const tags = Array.isArray(formData.intereses) ? [...formData.intereses] : [];
    if (!tags.includes(value)) {
      tags.push(value);
      setFormData({ ...formData, intereses: tags });
    }
    setInterestInput('');
  };

  const handleRemoveInterest = (removed) => {
    const tags = Array.isArray(formData.intereses) ? formData.intereses.filter(tag => tag !== removed) : [];
    setFormData({ ...formData, intereses: tags });
  };

  const generateInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(word => word[0]).slice(0, 2).join("").toUpperCase();
  };

  const handleAvatarClick = () => {
    if (!isEditing || avatarUploading) return;
    avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(file.type)) {
      setAvatarError('Solo se permiten imágenes JPG, PNG o WEBP.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setAvatarError('La imagen no puede pesar más de 3MB.');
      return;
    }

    setAvatarError(null);
    setAvatarUploading(true);

    try {
      const authToken = token || localStorage.getItem('pc_token');
      const resultado = await uploadFileToCloudinary(file);
      const perfilActualizado = await updateProfileRequest(authToken, { avatar_url: resultado.url });

      setProfile(perfilActualizado);
      setFormData(prev => ({ ...prev, avatar_url: perfilActualizado.avatar_url }));
    } catch (err) {
      console.error('Error subiendo avatar:', err);
      setAvatarError('No se pudo actualizar tu foto. Intenta de nuevo.');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading-card">
          <div className="spinner"></div>
          <p>Cargando tu espacio en IdeAgora...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <AlertCircle size={20} />
            <strong>Acceso Denegado</strong>
          </div>
          <p style={{ textAlign: 'center', margin: '8px 0 0 0', fontSize: '0.9rem' }}>{error}</p>
        </div>
      </div>
    );
  }

  const userDisplayName = isAdmin ? profile.name : profile.nombre_completo;

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        {/* Notificación de Éxito Temporal */}
        {successMessage && (
          <div className="success-toast">
            <CheckCircle size={18} /> {successMessage}
          </div>
        )}

        {/* 1. CABECERA TIPO BANNER SOCIAL */}
        <div className="profile-header-card">
          <div className="profile-banner-bg"></div>
          
          <div className="profile-header-content">
            <div className="profile-avatar-container">
              <div
                onClick={handleAvatarClick}
                className={`profile-avatar-frame ${isEditing ? 'editable' : ''}`}
                style={{
                  background: profile.avatar_url ? 'transparent' : 'linear-gradient(135deg, #4f46e5, #0f172a)',
                }}
              >
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" />
                ) : (
                  generateInitials(userDisplayName)
                )}

                {isEditing && (
                  <div className="avatar-edit-overlay">
                    {avatarUploading ? (
                      <span className="uploading-text">Subiendo...</span>
                    ) : (
                      <Pencil size={18} color="#fff" />
                    )}
                  </div>
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarFileChange}
                style={{ display: 'none' }}
              />
            </div>

            <div className="profile-title-section">
              <div className="profile-title-text">
                <h1>{userDisplayName}</h1>
                <span className="profile-role-badge">
                  {isAdmin ? (
                    <><Shield size={14} /> Administrador</>
                  ) : (
                    <><GraduationCap size={14} /> {profile.carrera || 'Estudiante'}</>
                  )}
                </span>
                {avatarError && <p className="avatar-error-msg">{avatarError}</p>}
              </div>

              {/* ACCIONES */}
              <div className="profile-actions-wrapper">
                {!isEditing ? (
                  <>
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={() => navigate('/user-management')}
                          className="btn-action btn-secondary"
                        >
                          <Users size={14} /> <span className="btn-text">Gestionar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/authLogs')}
                          className="btn-action btn-danger-outline"
                        >
                          <Shield size={14} /> <span className="btn-text">Logs</span>
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="btn-action btn-primary"
                    >
                      <Edit2 size={14} /> Editar Perfil
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="btn-action btn-danger"
                    >
                      <LogOut size={14} /> Salir
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="submit"
                      onClick={handleSaveChanges}
                      disabled={updateLoading}
                      className="btn-action btn-success"
                      style={{ opacity: updateLoading ? 0.6 : 1 }}
                    >
                      <Save size={14} /> {updateLoading ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsEditing(false); setFormData(profile); }}
                      className="btn-action btn-secondary"
                    >
                      <X size={14} /> Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. DISEÑO DE DOS COLUMNAS */}
        <div className="profile-content-grid">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="profile-left-column">
            
            <div className="profile-info-card">
              <h3>Información Básica</h3>
              
              <div className="info-item">
                <span className="info-label">Nombre Completo</span>
                {isEditing ? (
                  <input
                    type="text"
                    name={isAdmin ? "name" : "nombre_completo"}
                    value={isAdmin ? (formData.name || '') : (formData.nombre_completo || '')}
                    onChange={handleInputChange}
                    className="profile-input"
                  />
                ) : (
                  <p className="info-value">{userDisplayName}</p>
                )}
              </div>

              <div className="info-item">
                <span className="info-label"><Mail size={12} /> Correo Institucional</span>
                <p className="info-value email-value">{profile.email}</p>
              </div>

              {/* Links de Redes con SVGs puros sin usar componentes de Lucide rotos */}
              {!isAdmin && (
                <div className="social-links-section">
                  <div className="info-item">
                    <span className="info-label">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                      GitHub
                    </span>
                    {isEditing ? (
                      <input 
                        type="url" 
                        name="github_url" 
                        value={formData.github_url || ''} 
                        onChange={handleInputChange} 
                        placeholder="https://github.com/usuario"
                        className="profile-input" 
                      />
                    ) : (
                      profile.github_url ? (
                        <a href={profile.github_url} target="_blank" rel="noreferrer" className="social-link">
                          Ver GitHub
                        </a>
                      ) : <p className="info-value empty-text">No enlazado</p>
                    )}
                  </div>

                  <div className="info-item">
                    <span className="info-label">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                      LinkedIn
                    </span>
                    {isEditing ? (
                      <input 
                        type="url" 
                        name="linkedin_url" 
                        value={formData.linkedin_url || ''} 
                        onChange={handleInputChange} 
                        placeholder="https://linkedin.com/in/usuario"
                        className="profile-input" 
                      />
                    ) : (
                      profile.linkedin_url ? (
                        <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="social-link">
                          Ver LinkedIn
                        </a>
                      ) : <p className="info-value empty-text">No enlazado</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!isAdmin && (
              <div className="profile-info-card">
                <h3 className="card-title-icon"><User size={16} /> Sobre mí</h3>
                {isEditing ? (
                  <textarea 
                    name="biografia" 
                    value={formData.biografia || ''} 
                    onChange={handleInputChange} 
                    rows="4" 
                    placeholder="Cuéntale a la comunidad sobre ti..." 
                    className="profile-textarea"
                  />
                ) : (
                  <p className="bio-text">{profile.biografia || "No se ha añadido una biografía aún."}</p>
                )}
              </div>
            )}

            {/* Tarjeta de insignia — solo para estudiantes */}
            {!isAdmin && (
              <div className="profile-info-card profile-insignia-card">
                <h3 className="card-title-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,verticalAlign:'middle'}}>
                    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                  </svg>
                  Mi Insignia
                </h3>

                {insigniaDatos ? (
                  <div className="profile-insignia-contenido">
                    {/* Imagen de la insignia */}
                    <InsigniaBadge
                      insignia={insigniaDatos.insignia}
                      totalProyectos={insigniaDatos.totalProyectos}
                      tipo={insigniaDatos.insigniaManual ? 'manual' : 'auto'}
                      tamanio="lg"
                    />

                    {/* Barra de progreso hacia el siguiente nivel */}
                    {insigniaDatos.niveles && (() => {
                      // Buscamos el siguiente nivel al actual
                      const nivelesOrdenados = [...insigniaDatos.niveles].sort((a, b) => a.minProyectos - b.minProyectos);
                      const nivelActual = insigniaDatos.insignia;
                      const sigNivel = nivelesOrdenados.find(
                        (n) => n.minProyectos > (nivelActual?.minProyectos || 0)
                      );

                      if (!sigNivel) {
                        return (
                          <p className="profile-insignia-max">
                            Nivel maximo alcanzado
                          </p>
                        );
                      }

                      const inicio = nivelActual?.minProyectos || 0;
                      const progreso = Math.min(
                        ((insigniaDatos.totalProyectos - inicio) / (sigNivel.minProyectos - inicio)) * 100,
                        100
                      );

                      return (
                        <div className="profile-insignia-progreso">
                          <p className="profile-insignia-prox">
                            Siguiente: <strong>{sigNivel.nombre}</strong> ({sigNivel.minProyectos} proyectos)
                          </p>
                          <div className="profile-prog-barra-bg">
                            <div
                              className="profile-prog-barra-fill"
                              style={{
                                width: `${progreso}%`,
                                background: sigNivel.color,
                              }}
                            />
                          </div>
                          <p className="profile-prog-texto">
                            {insigniaDatos.totalProyectos} / {sigNivel.minProyectos} proyectos
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  /* Estado sin insignia aun */
                  <div className="profile-insignia-vacia">
                    <InsigniaBadge insignia={null} totalProyectos={0} tamanio="md" />
                    <p>Sube tu primer proyecto para ganar una insignia</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA */}
          <div className="profile-right-column">
            
            <div className="profile-info-card">
              <h3>{isAdmin ? "Rol e Identificación" : "Detalles Académicos"}</h3>
              
              <div className="academic-grid-form">
                {!isAdmin ? (
                  <>
                    <div className="info-item">
                      <span className="info-label"><BookOpen size={12} /> Universidad</span>
                      {isEditing ? (
                        <input type="text" name="universidad" value={formData.universidad || ''} onChange={handleInputChange} className="profile-input" />
                      ) : (
                        <p className="info-value">{profile.universidad}</p>
                      )}
                    </div>

                    <div className="info-item">
                      <span className="info-label">Facultad</span>
                      {isEditing ? (
                        <input type="text" name="facultad" value={formData.facultad || ''} onChange={handleInputChange} className="profile-input" />
                      ) : (
                        <p className="info-value">{profile.facultad || 'No asignada'}</p>
                      )}
                    </div>

                    <div className="info-item">
                      <span className="info-label">Carrera Actual</span>
                      {isEditing ? (
                        <input type="text" name="carrera" value={formData.carrera || ''} onChange={handleInputChange} className="profile-input" />
                      ) : (
                        <p className="info-value">{profile.carrera}</p>
                      )}
                    </div>

                    <div className="info-item">
                      <span className="info-label">Nivel / Semestre</span>
                      {isEditing ? (
                        <input type="text" name="semestre" value={formData.semestre || ''} onChange={handleInputChange} placeholder="Ej: 6to Semestre" className="profile-input" />
                      ) : (
                        <p className="info-value">{profile.semestre || 'No especificado'}</p>
                      )}
                    </div>

                    <div className="info-item full-width-row">
                      <span className="info-label"><MapPin size={12} /> Ciudad de Residencia</span>
                      {isEditing ? (
                        <input type="text" name="ciudad" value={formData.ciudad || ''} onChange={handleInputChange} className="profile-input" />
                      ) : (
                        <p className="info-value">{profile.ciudad || 'Quito, Ecuador'}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="info-item">
                      <span className="info-label">Cargo Administrativo</span>
                      {isEditing ? (
                        <input type="text" name="cargo" value={formData.cargo || ''} onChange={handleInputChange} placeholder="Ej: Director" className="profile-input" />
                      ) : (
                        <p className="info-value">{profile.cargo || 'No especificado'}</p>
                      )}
                    </div>

                    <div className="info-item">
                      <span className="info-label">Especialidad</span>
                      {isEditing ? (
                        <input type="text" name="especialidad" value={formData.especialidad || ''} onChange={handleInputChange} placeholder="Ej: Gestión" className="profile-input" />
                      ) : (
                        <p className="info-value">{profile.especialidad || 'No especificada'}</p>
                      )}
                    </div>

                    <div className="info-item full-width-row">
                      <span className="info-label">Sector / Departamento</span>
                      {isEditing ? (
                        <input type="text" name="sector" value={formData.sector || ''} onChange={handleInputChange} placeholder="Ej: TI" className="profile-input" />
                      ) : (
                        <p className="info-value">{profile.sector || 'No especificado'}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {!isAdmin && (
              <div className="profile-info-card">
                <h3 className="card-title-icon"><Compass size={16} /> Áreas de Interés Técnico</h3>
                {isEditing ? (
                  <div className="interest-editor-box">
                    <input
                      type="text"
                      value={interestInput}
                      onChange={handleInterestInputChange}
                      onKeyDown={handleInterestInputKeyDown}
                      placeholder="Escribe un interés y presiona Enter"
                      className="profile-input"
                    />
                    {Array.isArray(formData.intereses) && formData.intereses.length > 0 && (
                      <div className="tags-container">
                        {formData.intereses.map((interes, idx) => (
                          <span key={idx} className="tag-pill-editable">
                            {interes}
                            <button
                              type="button"
                              onClick={() => handleRemoveInterest(interes)}
                              className="tag-remove-btn"
                              aria-label={`Eliminar interés ${interes}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="tags-container">
                    {profile.intereses && profile.intereses.length > 0 ? (
                      profile.intereses.map((interes, idx) => (
                        <span key={idx} className="tag-pill">
                          {interes}
                        </span>
                      ))
                    ) : (
                      <p className="empty-text">No se han ingresado áreas de interés técnico aún.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}