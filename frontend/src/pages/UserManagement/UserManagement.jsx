import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../services/apiConfig.js';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './UserManagement.css';
import {
  Users,
  Search,
  Edit2,
  Trash2,
  UserX,
  UserCheck,
  Shield,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

export default function UserManagement() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const authToken = token || localStorage.getItem('pc_token');
      
      if (!authToken) {
        setError('No autorizado. Inicia sesión como administrador.');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      const authToken = token || localStorage.getItem('pc_token');
      await axios.post(`${API_BASE_URL}/api/admin/users/${userId}/deactivate`, 
        { duration: '720h' }, // 30 days
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      setSuccessMessage('Usuario desactivado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchUsers();
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al desactivar usuario');
    }
  };

  const handleActivate = async (userId) => {
    try {
      const authToken = token || localStorage.getItem('pc_token');
      await axios.post(`${API_BASE_URL}/api/admin/users/${userId}/activate`, {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      setSuccessMessage('Usuario activado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchUsers();
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al activar usuario');
    }
  };

  const handleDelete = async (userId) => {
    try {
      const authToken = token || localStorage.getItem('pc_token');
      await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      setSuccessMessage('Usuario eliminado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchUsers();
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  const openModal = (user, action) => {
    setSelectedUser(user);
    setModalAction(action);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalAction('');
    setShowModal(false);
  };

  const confirmAction = () => {
    if (!selectedUser) return;

    switch (modalAction) {
      case 'deactivate':
        handleDeactivate(selectedUser.id);
        break;
      case 'activate':
        handleActivate(selectedUser.id);
        break;
      case 'delete':
        handleDelete(selectedUser.id);
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="user-management-page">
        <div className="loading-container">
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management-page">
        <div className="error-container">
          <AlertCircle size={24} />
          <p>{error}</p>
          <button onClick={() => navigate('/profile')} className="btn-back">
            Volver al Perfil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-page">
      {/* Success Message */}
      {successMessage && (
        <div className="success-toast">
          <CheckCircle size={18} />
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="um-header">
        <div className="um-title-section">
          <Users size={32} />
          <div>
            <h1>Gestión de Usuarios</h1>
            <p>Administra todos los usuarios del sistema</p>
          </div>
        </div>
        <button onClick={() => navigate('/profile')} className="btn-back">
          Volver al Perfil
        </button>
      </div>

      {/* Stats Cards */}
      <div className="um-stats">
        <div className="stat-card">
          <Users size={24} />
          <div>
            <h3>{users.length}</h3>
            <p>Total Usuarios</p>
          </div>
        </div>
        <div className="stat-card">
          <UserCheck size={24} />
          <div>
            <h3>{users.filter(u => u.is_active).length}</h3>
            <p>Activos</p>
          </div>
        </div>
        <div className="stat-card">
          <UserX size={24} />
          <div>
            <h3>{users.filter(u => !u.is_active).length}</h3>
            <p>Inactivos</p>
          </div>
        </div>
        <div className="stat-card">
          <Shield size={24} />
          <div>
            <h3>{users.filter(u => u.role === 'admin').length}</h3>
            <p>Administradores</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="um-search">
        <Search size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="um-table-container">
        <table className="um-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Último Acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role === 'admin' ? (
                        <><Shield size={14} /> Admin</>
                      ) : (
                        <><GraduationCap size={14} /> Estudiante</>
                      )}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{formatDate(user.last_sign_in_at)}</td>
                  <td>
                    <div className="action-buttons">
                      {user.is_active ? (
                        <button
                          onClick={() => openModal(user, 'deactivate')}
                          className="btn-action btn-deactivate"
                          title="Desactivar usuario"
                        >
                          <UserX size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => openModal(user, 'activate')}
                          className="btn-action btn-activate"
                          title="Activar usuario"
                        >
                          <UserCheck size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => openModal(user, 'delete')}
                        className="btn-action btn-delete"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Acción</h2>
              <button onClick={closeModal} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                {modalAction === 'deactivate' && `¿Desactivar temporalmente a ${selectedUser.name}?`}
                {modalAction === 'activate' && `¿Activar la cuenta de ${selectedUser.name}?`}
                {modalAction === 'delete' && `¿Eliminar permanentemente a ${selectedUser.name}? Esta acción no se puede deshacer.`}
              </p>
              <p className="modal-email">{selectedUser.email}</p>
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="btn-cancel">
                Cancelar
              </button>
              <button 
                onClick={confirmAction} 
                className={`btn-confirm ${modalAction === 'delete' ? 'btn-danger' : ''}`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}