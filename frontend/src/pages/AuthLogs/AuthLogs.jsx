import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../services/apiConfig.js';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AuthLogs.css';
import {
  Shield,
  Calendar,
  User,
  Activity,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export default function AuthLogs() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const logsPerPage = 20;
  
  // Filters
  const [searchEmail, setSearchEmail] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    fetchLogs();
    fetchStatistics();
  }, [currentPage, filterAction]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const authToken = token || localStorage.getItem('pc_token');
      if (!authToken) {
        setError('Debes iniciar sesión como administrador');
        return;
      }

      const offset = (currentPage - 1) * logsPerPage;
      let url = `/api/authLogs?limit=${logsPerPage}&offset=${offset}`;
      
      if (filterAction !== 'all') {
        url = `/api/authLogs/action/${filterAction}?limit=${logsPerPage}`;
      }

      const response = await axios.get(`${API_BASE_URL}${url}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      setLogs(response.data.data || []);
      setTotalLogs(response.data.total || 0);
    } catch (err) {
      console.error('Error fetching logs:', err);
      if (err.response?.status === 403) {
        setError('Acceso denegado. Solo administradores pueden ver los logs.');
        setTimeout(() => navigate('/profile'), 2000);
      } else {
        setError(err.response?.data?.message || 'Error al cargar los logs');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const authToken = token || localStorage.getItem('pc_token');
      if (!authToken) return;

      const response = await axios.get(`${API_BASE_URL}/api/authLogs/statistics`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      setStatistics(response.data.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadge = (action) => {
    const normalizedAction = String(action || '').toLowerCase();
    const badges = {
      register: { color: '#10b981', label: 'Registro' },
      register_admin: { color: '#8b5cf6', label: 'Registro Admin' },
      login: { color: '#3b82f6', label: 'Inicio de sesión' },
      logout: { color: '#6b7280', label: 'Cierre de sesión' },
      delete: { color: '#ef4444', label: 'Borrado' },
      password_change: { color: '#f59e0b', label: 'Cambio de contraseña' }
    };

    const badge = badges[normalizedAction] || { color: '#64748b', label: action };
    
    return (
      <span style={{
        background: badge.color,
        color: '#fff',
        padding: '4px 12px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '600'
      }}>
        {badge.label}
      </span>
    );
  };

  const filteredLogs = logs.filter(log => 
    searchEmail === '' || log.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  const totalPages = Math.ceil(totalLogs / logsPerPage);

  if (loading && logs.length === 0) {
    return (
      <div className="auth-logs-page">
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <Activity size={40} style={{ margin: '0 auto 16px' }} />
          <p>Cargando logs del sistema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-logs-page">
        <div className="logs-error">
          <AlertCircle size={24} />
          <h3>Error de Acceso</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-logs-page">
      <div className="logs-container">
        
        {/* Header */}
        <div className="logs-header">
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
              <Shield size={32} style={{ color: '#dc2626' }} />
              Logs de Autenticación
            </h1>
            <p style={{ color: '#64748b', margin: '8px 0 0 0' }}>
              Registro de actividad de usuarios en el sistema
            </p>
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="btn-back"
          >
            Volver al Perfil
          </button>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="stats-grid">
            <div className="stat-card">
              <Activity size={24} style={{ color: '#3b82f6' }} />
              <div>
                <p className="stat-label">Total de Eventos</p>
                <p className="stat-value">{statistics.totalLogs || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <User size={24} style={{ color: '#10b981' }} />
              <div>
                <p className="stat-label">Usuarios Únicos</p>
                <p className="stat-value">{statistics.uniqueUsers || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <Calendar size={24} style={{ color: '#f59e0b' }} />
              <div>
                <p className="stat-label">Registros</p>
                <p className="stat-value">{statistics.actionStats?.register || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <Shield size={24} style={{ color: '#8b5cf6' }} />
              <div>
                <p className="stat-label">Inicios de Sesión</p>
                <p className="stat-value">{statistics.actionStats?.login || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <Search size={18} style={{ color: '#64748b' }} />
            <input
              type="text"
              placeholder="Buscar por email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <Filter size={18} style={{ color: '#64748b' }} />
            <select 
              value={filterAction} 
              onChange={(e) => {
                setFilterAction(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Todas las acciones</option>
              <option value="register">Registros</option>
              <option value="register_admin">Registros Admin</option>
              <option value="login">Inicios de Sesión</option>
              <option value="logout">Cierres de Sesión</option>
              <option value="delete">Borrados</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="logs-table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Email</th>
                <th>Acción</th>
                <th>IP</th>
                <th>Navegador</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No se encontraron logs con los filtros aplicados
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.created_at)}</td>
                    <td style={{ fontWeight: '500' }}>{log.email}</td>
                    <td>{getActionBadge(log.action)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {log.ip_address || 'N/A'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.user_agent ? log.user_agent.substring(0, 50) + '...' : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <ChevronLeft size={18} />
              Anterior
            </button>
            
            <span className="pagination-info">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Siguiente
              <ChevronRight size={18} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}