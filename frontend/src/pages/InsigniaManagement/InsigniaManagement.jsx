import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchInsignias, asignarInsignia, removerInsignia } from '../../services/adminService.js';
/* Imagenes SVG de insignias */
import imgExplorador  from '../../assets/insignias/explorador.svg';
import imgConstructor from '../../assets/insignias/constructor.svg';
import imgInnovador   from '../../assets/insignias/innovador.svg';
import imgPionero     from '../../assets/insignias/pionero.svg';
import imgMaestro     from '../../assets/insignias/maestro.svg';
import imgSinInsignia from '../../assets/insignias/sin-insignia.svg';
import {
  Award,
  Search,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  X,
  Trash2,
  Users,
  BarChart2,
} from 'lucide-react';
import './InsigniaManagement.css';

/* Mapa de imagenes SVG por nombre de insignia */
const MAPA_IMAGEN = {
  Explorador:  imgExplorador,
  Constructor: imgConstructor,
  Innovador:   imgInnovador,
  Pionero:     imgPionero,
  Maestro:     imgMaestro,
};

/* Niveles disponibles sincronizados con el backend */
const NIVELES = [
  { nombre: 'Explorador',  color: '#6b7280', minProyectos: 1  },
  { nombre: 'Constructor', color: '#3b82f6', minProyectos: 3  },
  { nombre: 'Innovador',   color: '#8b5cf6', minProyectos: 5  },
  { nombre: 'Pionero',     color: '#f59e0b', minProyectos: 10 },
  { nombre: 'Maestro',     color: '#ef4444', minProyectos: 20 },
];

export default function InsigniaManagement() {
  const { token, user } = useAuth();
  const navegar = useNavigate();

  /* Estado principal */
  const [usuarios, setUsuarios] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  /* Modal de asignacion */
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [nivelSeleccionado, setNivelSeleccionado] = useState('');
  const [guardando, setGuardando] = useState(false);

  /* Redirige si no es admin */
  const rolUsuario = user?.profile?.rol || user?.auth?.user_metadata?.rol;
  useEffect(() => {
    if (user && rolUsuario !== 'administrador') {
      navegar('/');
    }
  }, [user, rolUsuario, navegar]);

  /* Carga inicial de usuarios con insignias */
  useEffect(() => {
    cargarDatos();
  }, []);

  /* Filtra por busqueda */
  useEffect(() => {
    if (!busqueda.trim()) {
      setFiltrados(usuarios);
    } else {
      const termino = busqueda.toLowerCase();
      setFiltrados(
        usuarios.filter(
          (u) =>
            u.nombre.toLowerCase().includes(termino) ||
            (u.universidad || '').toLowerCase().includes(termino)
        )
      );
    }
  }, [busqueda, usuarios]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);
      const authToken = token || localStorage.getItem('pc_token');
      const datos = await fetchInsignias(authToken);
      setUsuarios(datos);
      setFiltrados(datos);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar insignias');
    } finally {
      setCargando(false);
    }
  };

  /* Abre el modal para asignar insignia */
  const abrirModal = (usuario) => {
    setUsuarioSeleccionado(usuario);
    // Pre-selecciona el nivel actual si tiene uno
    setNivelSeleccionado(usuario.insigniaEfectiva?.nombre || '');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioSeleccionado(null);
    setNivelSeleccionado('');
  };

  /* Confirma la asignacion de insignia */
  const confirmarAsignacion = async () => {
    if (!usuarioSeleccionado || !nivelSeleccionado) return;
    try {
      setGuardando(true);
      const authToken = token || localStorage.getItem('pc_token');
      await asignarInsignia(authToken, usuarioSeleccionado.usuarioId, nivelSeleccionado);
      mostrarExito(`Insignia "${nivelSeleccionado}" asignada a ${usuarioSeleccionado.nombre}`);
      cargarDatos();
      cerrarModal();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al asignar insignia');
    } finally {
      setGuardando(false);
    }
  };

  /* Remueve la insignia manual de un usuario */
  const manejarRemover = async (usuario) => {
    if (!confirm(`¿Quitar insignia manual de ${usuario.nombre}? Volvera a ser automatica.`)) return;
    try {
      const authToken = token || localStorage.getItem('pc_token');
      await removerInsignia(authToken, usuario.usuarioId);
      mostrarExito(`Insignia manual removida de ${usuario.nombre}`);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al remover insignia');
    }
  };

  /* Muestra mensaje de exito y lo oculta despues de 3 segundos */
  const mostrarExito = (msg) => {
    setMensajeExito(msg);
    setTimeout(() => setMensajeExito(''), 3000);
  };

  /* Formato legible del numero de proyectos */
  const etiquetaProyectos = (n) =>
    n === 0 ? 'Sin proyectos' : n === 1 ? '1 proyecto' : `${n} proyectos`;

  if (cargando) {
    return (
      <div className="ins-page">
        <div className="ins-loading">
          <div className="ins-spinner" />
          <p>Cargando insignias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ins-page">
        <div className="ins-error">
          <AlertCircle size={28} />
          <p>{error}</p>
          <button onClick={() => navegar('/perfil')} className="ins-btn-back">
            Volver al Perfil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ins-page">
      {/* Toast de exito */}
      {mensajeExito && (
        <div className="ins-toast">
          <CheckCircle size={18} />
          {mensajeExito}
        </div>
      )}

      {/* Encabezado */}
      <div className="ins-header">
        <div className="ins-title-section">
          <Award size={32} className="ins-header-icon" />
          <div>
            <h1>Gestion de Insignias</h1>
            <p>Asigna insignias a los estudiantes segun sus meritos</p>
          </div>
        </div>
        <div className="ins-header-actions">
          <button onClick={() => navegar('/admin-dashboard')} className="ins-btn-secondary">
            <BarChart2 size={16} /> Dashboard
          </button>
          <button onClick={() => navegar('/user-management')} className="ins-btn-secondary">
            <Users size={16} /> Usuarios
          </button>
          <button onClick={() => navegar('/perfil')} className="ins-btn-back">
            Volver al Perfil
          </button>
        </div>
      </div>

      {/* Tarjetas resumen de niveles */}
      <div className="ins-niveles">
        {NIVELES.map((nivel) => {
          const cantUsuarios = usuarios.filter(
            (u) => u.insigniaEfectiva?.nombre === nivel.nombre
          ).length;
          return (
            <div key={nivel.nombre} className="ins-nivel-card" style={{ borderColor: nivel.color }}>
              {/* Imagen SVG en lugar de emoji */}
              <img
                src={MAPA_IMAGEN[nivel.nombre] || imgSinInsignia}
                alt={nivel.nombre}
                className="ins-nivel-img"
              />
              <div>
                <p className="ins-nivel-nombre" style={{ color: nivel.color }}>{nivel.nombre}</p>
                <p className="ins-nivel-info">desde {nivel.minProyectos} proyecto{nivel.minProyectos > 1 ? 's' : ''}</p>
                <p className="ins-nivel-usuarios">{cantUsuarios} usuario{cantUsuarios !== 1 ? 's' : ''}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Buscador */}
      <div className="ins-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar por nombre o universidad..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla de usuarios */}
      <div className="ins-table-container">
        <table className="ins-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Universidad</th>
              <th>Proyectos</th>
              <th>Insignia auto</th>
              <th>Insignia efectiva</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan="7" className="ins-empty">No se encontraron estudiantes</td>
              </tr>
            ) : (
              filtrados.map((u) => (
                <tr key={u.usuarioId}>
                  {/* Nombre */}
                  <td>
                    <div className="ins-user-cell">
                      <div className="ins-avatar">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.nombre} />
                        ) : (
                          u.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                        )}
                      </div>
                      <span>{u.nombre}</span>
                    </div>
                  </td>
                  {/* Universidad */}
                  <td className="ins-td-muted">{u.universidad || '—'}</td>
                  {/* Conteo proyectos */}
                  <td>
                    <span className="ins-badge-count">{etiquetaProyectos(u.totalProyectos)}</span>
                  </td>
                  {/* Insignia automatica — usa imagen SVG */}
                  <td>
                    {u.insigniaAuto ? (
                      <span className="ins-badge-insignia" style={{ background: u.insigniaAuto.color + '22', color: u.insigniaAuto.color, borderColor: u.insigniaAuto.color }}>
                        <img src={MAPA_IMAGEN[u.insigniaAuto.nombre] || imgSinInsignia} alt={u.insigniaAuto.nombre} className="ins-badge-img" />
                        {u.insigniaAuto.nombre}
                      </span>
                    ) : (
                      <span className="ins-badge-none">Sin insignia</span>
                    )}
                  </td>
                  {/* Insignia efectiva — usa imagen SVG */}
                  <td>
                    {u.insigniaEfectiva ? (
                      <span className="ins-badge-insignia ins-badge-efectiva" style={{ background: u.insigniaEfectiva.color + '22', color: u.insigniaEfectiva.color, borderColor: u.insigniaEfectiva.color }}>
                        <img src={MAPA_IMAGEN[u.insigniaEfectiva.nombre] || imgSinInsignia} alt={u.insigniaEfectiva.nombre} className="ins-badge-img" />
                        {u.insigniaEfectiva.nombre}
                      </span>
                    ) : (
                      <span className="ins-badge-none">Sin insignia</span>
                    )}
                  </td>
                  {/* Tipo: manual o auto */}
                  <td>
                    <span className={`ins-tipo-badge ${u.insigniaManual ? 'ins-tipo-manual' : 'ins-tipo-auto'}`}>
                      {u.insigniaManual ? 'Manual' : 'Auto'}
                    </span>
                  </td>
                  {/* Acciones */}
                  <td>
                    <div className="ins-actions">
                      <button
                        className="ins-btn-asignar"
                        onClick={() => abrirModal(u)}
                        title="Asignar insignia"
                      >
                        <Award size={15} /> Asignar
                      </button>
                      {u.insigniaManual && (
                        <button
                          className="ins-btn-remover"
                          onClick={() => manejarRemover(u)}
                          title="Remover insignia manual"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de asignacion */}
      {modalAbierto && usuarioSeleccionado && (
        <div className="ins-modal-overlay" onClick={cerrarModal}>
          <div className="ins-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ins-modal-header">
              <h2>Asignar Insignia</h2>
              <button onClick={cerrarModal} className="ins-modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="ins-modal-body">
              <p className="ins-modal-nombre">
                <strong>{usuarioSeleccionado.nombre}</strong>
              </p>
              <p className="ins-modal-info">
                {etiquetaProyectos(usuarioSeleccionado.totalProyectos)} &bull;{' '}
                Insignia auto: {usuarioSeleccionado.insigniaAuto?.nombre || 'Ninguna'}
              </p>

              {/* Selector de nivel — imagen SVG en lugar de emoji */}
              <div className="ins-modal-niveles">
                {NIVELES.map((nivel) => (
                  <button
                    key={nivel.nombre}
                    className={`ins-nivel-opcion ${nivelSeleccionado === nivel.nombre ? 'ins-nivel-opcion--activo' : ''}`}
                    style={{
                      borderColor: nivelSeleccionado === nivel.nombre ? nivel.color : '#e5e7eb',
                      background: nivelSeleccionado === nivel.nombre ? nivel.color + '15' : '#fff',
                    }}
                    onClick={() => setNivelSeleccionado(nivel.nombre)}
                  >
                    <img
                      src={MAPA_IMAGEN[nivel.nombre] || imgSinInsignia}
                      alt={nivel.nombre}
                      className="ins-opcion-img"
                    />
                    <span className="ins-opcion-nombre" style={{ color: nivel.color }}>{nivel.nombre}</span>
                    <span className="ins-opcion-req">desde {nivel.minProyectos} proy.</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="ins-modal-footer">
              <button onClick={cerrarModal} className="ins-btn-cancelar">
                Cancelar
              </button>
              <button
                onClick={confirmarAsignacion}
                className="ins-btn-confirmar"
                disabled={!nivelSeleccionado || guardando}
              >
                {guardando ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
