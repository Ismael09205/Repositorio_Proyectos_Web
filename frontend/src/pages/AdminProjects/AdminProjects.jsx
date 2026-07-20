import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchProyectosAdmin, eliminarProyectoAdmin } from '../../services/adminService.js';
import {
  ArrowLeft,
  Search,
  Trash2,
  ExternalLink,
  AlertTriangle,
  X,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import './AdminProjects.css';

const CATEGORIAS = [
  'all',
  'Inteligencia Artificial',
  'Desarrollo Web',
  'Desarrollo Móvil',
  'Ciberseguridad',
  'Ciencia de Datos',
  'IoT',
  'Videojuegos',
  'Robótica',
  'Blockchain',
  'Otro',
];

/* Modal de confirmación de eliminación */
function ModalConfirmar({ proyecto, onConfirmar, onCancelar, eliminando }) {
  return (
    <div className="admp-overlay" onClick={onCancelar}>
      <div className="admp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admp-modal-icono">
          <AlertTriangle size={28} />
        </div>
        <h2 className="admp-modal-titulo">Eliminar proyecto</h2>
        <p className="admp-modal-desc">
          Estás a punto de eliminar permanentemente el proyecto:
        </p>
        <p className="admp-modal-nombre">"{proyecto.titulo}"</p>
        <p className="admp-modal-aviso">
          Esta acción no se puede deshacer. Se eliminarán también todos sus comentarios y likes.
        </p>
        <div className="admp-modal-acciones">
          <button className="admp-btn-cancelar" onClick={onCancelar} disabled={eliminando}>
            <X size={14} /> Cancelar
          </button>
          <button className="admp-btn-eliminar" onClick={onConfirmar} disabled={eliminando}>
            {eliminando ? 'Eliminando…' : <><Trash2 size={14} /> Eliminar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProjects() {
  const { token, user } = useAuth();
  const navegar = useNavigate();

  const [proyectos, setProyectos]     = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState(null);
  const [busqueda, setBusqueda]       = useState('');
  const [categoria, setCategoria]     = useState('all');
  const [sort, setSort]               = useState('recent');
  const [confirmacion, setConfirmacion] = useState(null); // proyecto a eliminar
  const [eliminando, setEliminando]   = useState(false);
  const [msgExito, setMsgExito]       = useState('');

  /* Redirige si no es admin */
  const rol = user?.profile?.rol || user?.auth?.user_metadata?.rol;
  useEffect(() => {
    if (user && rol !== 'administrador') navegar('/');
  }, [user, rol, navegar]);

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const authToken = token || localStorage.getItem('pc_token');
      const data = await fetchProyectosAdmin(authToken, { q: busqueda, categoria, sort });
      setProyectos(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar proyectos');
    } finally {
      setCargando(false);
    }
  }, [token, busqueda, categoria, sort]);

  useEffect(() => { cargar(); }, [cargar]);

  const confirmarEliminar = (proyecto) => setConfirmacion(proyecto);
  const cancelarEliminar  = () => setConfirmacion(null);

  const ejecutarEliminar = async () => {
    if (!confirmacion) return;
    setEliminando(true);
    try {
      const authToken = token || localStorage.getItem('pc_token');
      await eliminarProyectoAdmin(authToken, confirmacion.id);
      setProyectos((prev) => prev.filter((p) => p.id !== confirmacion.id));
      setMsgExito(`Proyecto "${confirmacion.titulo}" eliminado correctamente.`);
      setTimeout(() => setMsgExito(''), 4000);
      setConfirmacion(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar el proyecto');
      setConfirmacion(null);
    } finally {
      setEliminando(false);
    }
  };

  const formatFecha = (iso) =>
    iso ? new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="admp-page">

      {/* Encabezado */}
      <div className="admp-header">
        <div className="admp-title-section">
          <FolderOpen size={24} className="admp-header-icon" />
          <div>
            <h1>Auditoría de Proyectos</h1>
            <p>Revisa y gestiona todos los proyectos de la plataforma</p>
          </div>
        </div>
        <div className="admp-header-actions">
          <button onClick={cargar} className="admp-btn-refresh" title="Recargar">
            <RefreshCw size={14} />
          </button>
          <button onClick={() => navegar('/admin-dashboard')} className="admp-btn-back">
            <ArrowLeft size={14} /> Dashboard
          </button>
        </div>
      </div>

      {/* Mensaje de éxito */}
      {msgExito && <div className="admp-exito">{msgExito}</div>}

      {/* Filtros */}
      <div className="admp-filtros">
        <div className="admp-busqueda-wrap">
          <Search size={14} className="admp-busqueda-icono" />
          <input
            type="text"
            placeholder="Buscar por título, autor…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="admp-busqueda"
          />
        </div>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="admp-select">
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'Todas las categorías' : c}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="admp-select">
          <option value="recent">Más recientes</option>
          <option value="popular">Más populares</option>
          <option value="likes">Más likes</option>
        </select>
        <span className="admp-contador">
          {cargando ? '…' : `${proyectos.length} proyecto${proyectos.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Tabla / contenido */}
      {cargando ? (
        <div className="admp-loading">
          <div className="admp-spinner" />
          <p>Cargando proyectos…</p>
        </div>
      ) : error ? (
        <div className="admp-error">
          <AlertTriangle size={20} />
          <p>{error}</p>
          <button onClick={cargar} className="admp-btn-back">Reintentar</button>
        </div>
      ) : proyectos.length === 0 ? (
        <div className="admp-vacio">
          <FolderOpen size={36} />
          <p>No se encontraron proyectos</p>
        </div>
      ) : (
        <div className="admp-tabla-wrap">
          <table className="admp-tabla">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Autor</th>
                <th>Categoría</th>
                <th>Fecha</th>
                <th className="admp-th-num">Visitas</th>
                <th className="admp-th-num">Likes</th>
                <th className="admp-th-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((p) => (
                <tr key={p.id} className="admp-fila">
                  <td className="admp-td-titulo">
                    <span className="admp-titulo">{p.titulo}</span>
                    {p.resumen && (
                      <span className="admp-resumen">{p.resumen.slice(0, 80)}{p.resumen.length > 80 ? '…' : ''}</span>
                    )}
                  </td>
                  <td className="admp-td-autor">
                    {p.autor?.nombre_completo || p.autor?.username || '—'}
                    {p.universidad && <span className="admp-univ">{p.universidad}</span>}
                  </td>
                  <td>
                    <span className="admp-badge">{p.categoria || '—'}</span>
                  </td>
                  <td className="admp-td-fecha">{formatFecha(p.created_at)}</td>
                  <td className="admp-td-num">{p.visitas_count ?? 0}</td>
                  <td className="admp-td-num">{p.likes_count ?? 0}</td>
                  <td className="admp-td-acciones">
                    <button
                      className="admp-btn-ver"
                      title="Ver proyecto"
                      onClick={() => navegar(`/proyecto/${p.id}`)}
                    >
                      <ExternalLink size={14} />
                    </button>
                    <button
                      className="admp-btn-eliminar-fila"
                      title="Eliminar proyecto"
                      onClick={() => confirmarEliminar(p)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmacion && (
        <ModalConfirmar
          proyecto={confirmacion}
          onConfirmar={ejecutarEliminar}
          onCancelar={cancelarEliminar}
          eliminando={eliminando}
        />
      )}
    </div>
  );
}
