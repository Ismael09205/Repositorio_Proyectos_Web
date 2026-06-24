import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Profile.css'; // ¡IMPORTANTE! Agregada la importación de tus estilos reales
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
  Users
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

        const response = await axios.get('/api/users/profile', {
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

        // Check if user is admin
        try {
          const adminCheck = await axios.get('/api/authLogs/statistics', {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          if (adminCheck.status === 200) {
            setIsAdmin(true);
          }
        } catch (adminErr) {
          setIsAdmin(false);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error al conectar con IdeAgora.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [token]);

  // 2. Enviar las actualizaciones del formulario al Backend (Método PUT)
  async function handleSaveChanges(e) {
    e.preventDefault();

    // Validación manual del nombre completo
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

      const response = await axios.put('/api/users/profile', formData, {
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

  // 3. Destruir la sesión activa en el cliente
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

  if (loading) {
    return (
      <div className="profile-page">
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <p>Cargando tus datos...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <div style={{ display: 'flex', itemsCenter: 'center', gap: '8px', justifyContent: 'center' }}>
            <AlertCircle size={20} />
            <strong>Acceso Denegado</strong>
          </div>
          <p style={{ textAlign: 'center', margin: '8px 0 0 0', fontSize: '0.9rem' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">

        {/* Notificación de Éxito Temporal */}
        {successMessage && (
          <div style={{
            position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
            background: '#10b981', color: '#fff', padding: '12px 24px',
            borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
          }}>
            <CheckCircle size={18} /> {successMessage}
          </div>
        )}

        {/* ENCABEZADO PRINCIPAL */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Iniciales dinámicas */}
            <div style={{
              width: '72px', height: '72px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #334155, #0f172a)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContext: 'center',
              fontSize: '1.5rem', fontWeight: 'bold', justifyContent: 'center', userSelect: 'none'
            }}>
              {generateInitials(profile.nombre_completo)}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{isAdmin ? profile.name : profile.nombre_completo}</h1>
              <p style={{ color: '#64748b', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                {isAdmin ? (
                  <><Shield size={16} style={{ color: '#dc2626' }} /> Administrador</>
                ) : (
                  <><GraduationCap size={16} style={{ color: '#2563eb' }} /> {profile.carrera || 'Estudiante'}</>
                )}
              </p>
            </div>
          </div>

          {/* BOTONES DE ACCIONES */}
           <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {!isEditing ? (
              <>
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate('/user-management')}
                      style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Users size={14} /> Gestionar Usuarios
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/authLogs')}
                      style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Shield size={14} /> Visualizar Logs
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit2 size={14} /> Editar Perfil
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <LogOut size={14} /> Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <button
                  type="submit"
                  onClick={handleSaveChanges}
                  disabled={updateLoading}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: updateLoading ? 0.6 : 1 }}
                >
                  <Save size={14} /> {updateLoading ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setFormData(profile); }}
                  style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <X size={14} /> Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        {/* GRID DE INFORMACIÓN CON TUS ESTILOS CSS */}
        <div className="profile-grid">

          <div>
            <strong>Nombre Completo</strong>
            {isEditing ? (
              <input
                type="text"
                name={isAdmin ? "name" : "nombre_completo"}
                value={isAdmin ? (formData.name || '') : (formData.nombre_completo || '')}
                onChange={handleInputChange}
                placeholder="Ingresa tu nombre completo"
                style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            ) : (
              <p>{isAdmin ? profile.name : profile.nombre_completo}</p>
            )}
          </div>

          {!isAdmin ? (
            <>
              <div>
                <strong>Universidad</strong>
                {isEditing ? (
                  <input type="text" name="universidad" value={formData.universidad || ''} onChange={handleInputChange} style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                ) : (
                  <p>{profile.universidad}</p>
                )}
              </div>

              <div>
                <strong>Facultad</strong>
                {isEditing ? (
                  <input type="text" name="facultad" value={formData.facultad || ''} onChange={handleInputChange} style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                ) : (
                  <p>{profile.facultad || 'No asignada'}</p>
                )}
              </div>

              <div>
                <strong>Carrera Actual</strong>
                {isEditing ? (
                  <input type="text" name="carrera" value={formData.carrera || ''} onChange={handleInputChange} style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                ) : (
                  <p>{profile.carrera}</p>
                )}
              </div>

              <div>
                <strong>Nivel / Semestre</strong>
                {isEditing ? (
                  <input type="text" name="semestre" value={formData.semestre || ''} onChange={handleInputChange} placeholder="Ej: 6to Semestre" style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                ) : (
                  <p>{profile.semestre || 'No especificado'}</p>
                )}
              </div>

              <div>
                <strong>Ciudad de Residencia</strong>
                {isEditing ? (
                  <input type="text" name="ciudad" value={formData.ciudad || ''} onChange={handleInputChange} style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                ) : (
                  <p>{profile.ciudad || 'Quito, Ecuador'}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <strong>Cargo</strong>
                {isEditing ? (
                  <input type="text" name="cargo" value={formData.cargo || ''} onChange={handleInputChange} placeholder="Ej: Director, Coordinador" style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                ) : (
                  <p>{profile.cargo || 'No especificado'}</p>
                )}
              </div>

              <div>
                <strong>Especialidad</strong>
                {isEditing ? (
                  <input type="text" name="especialidad" value={formData.especialidad || ''} onChange={handleInputChange} placeholder="Ej: Gestión Académica" style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                ) : (
                  <p>{profile.especialidad || 'No especificada'}</p>
                )}
              </div>

              <div>
                <strong>Sector</strong>
                {isEditing ? (
                  <input type="text" name="sector" value={formData.sector || ''} onChange={handleInputChange} placeholder="Ej: Departamento de TI" style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                ) : (
                  <p>{profile.sector || 'No especificado'}</p>
                )}
              </div>
            </>
          )}

          <div style={{ gridColumn: 'span 2' }}>
            <strong>Correo Institucional</strong>
            <p style={{ color: '#475569', fontStyle: 'italic' }}>{profile.email}</p>
          </div>
          
          {!isAdmin && (
            <>
            {/* SOBRE MÍ */}
              <div style={{ gridColumn: 'span 2' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> Sobre mí / Biografía</strong>
                {isEditing ? (
                  <textarea name="biografia" value={formData.biografia || ''} onChange={handleInputChange} rows="4" placeholder="Cuéntale a la comunidad sobre ti..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'none' }} />
                ) : (
                  <p style={{ lineHeight: '1.5' }}>{profile.biografia || "No se ha añadido una biografía aún."}</p>
                )}
              </div>

          {/* INTERESES */}
          <div style={{ gridColumn: 'span 2' }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Compass size={14} /> Áreas de Interés Técnico</strong>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={interestInput}
                  onChange={handleInterestInputChange}
                  onKeyDown={handleInterestInputKeyDown}
                  placeholder="Escribe un interés y presiona Enter"
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
                {Array.isArray(formData.intereses) && formData.intereses.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                    {formData.intereses.map((interes, idx) => (
                      <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', color: '#1e40af', background: '#dbeafe', padding: '4px 10px', borderRadius: '999px' }}>
                        {interes}
                        <button
                          type="button"
                          onClick={() => handleRemoveInterest(interes)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#1e40af',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            lineHeight: 1,
                            padding: 0,
                          }}
                          aria-label={`Eliminar interés ${interes}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {profile.intereses && profile.intereses.length > 0 ? (
                  profile.intereses.map((interes, idx) => (
                    <span key={idx} style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1e40af', background: '#dbeafe', padding: '4px 10px', borderRadius: '8px' }}>
                      {interes}
                    </span>
                  ))
                ) : (
                  <p style={{ fontStyle: 'italic', color: '#94a3b8' }}>No se han ingresado intereses aún.</p>
                )}
              </div>
            )}
          </div>

          {/* ENLACES EXTERNOS */}
          <div>
            <strong>Perfil de GitHub</strong>
            {isEditing ? (
              <input type="url" name="github_url" value={formData.github_url || ''} onChange={handleInputChange} placeholder="https://github.com/usuario" style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
            ) : (
              profile.github_url ? <a href={profile.github_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>Ver GitHub</a> : <p>No enlazado</p>
            )}
          </div>

          <div>
            <strong>Perfil de LinkedIn</strong>
            {isEditing ? (
              <input type="url" name="linkedin_url" value={formData.linkedin_url || ''} onChange={handleInputChange} placeholder="https://linkedin.com/in/usuario" style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
            ) : (
              profile.linkedin_url ? <a href={profile.linkedin_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>Ver LinkedIn</a> : <p>No enlazado</p>
            )}
          </div>
            </>
          )}
        </div>
        
      </div>
    </div>
  );
}