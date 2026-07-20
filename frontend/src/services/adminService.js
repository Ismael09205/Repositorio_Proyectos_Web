import axios from 'axios';
import API_BASE_URL from './apiConfig.js';

/* URL base de rutas admin */
const ADMIN_URL = `${API_BASE_URL}/api/admin`;

/* Cabecera de autorizacion con token */
const cabeceras = (token) => ({ Authorization: `Bearer ${token}` });

/* ---- INSIGNIAS ---- */

/* Obtiene todos los usuarios con su insignia actual */
export const fetchInsignias = async (token) => {
  const res = await axios.get(`${ADMIN_URL}/insignias`, { headers: cabeceras(token) });
  return res.data;
};

/* Asigna una insignia a un usuario */
export const asignarInsignia = async (token, usuarioId, nombreInsignia) => {
  const res = await axios.post(
    `${ADMIN_URL}/insignias/${usuarioId}`,
    { nombreInsignia },
    { headers: cabeceras(token) }
  );
  return res.data;
};

/* Remueve la insignia manual de un usuario */
export const removerInsignia = async (token, usuarioId) => {
  const res = await axios.delete(`${ADMIN_URL}/insignias/${usuarioId}`, {
    headers: cabeceras(token),
  });
  return res.data;
};

/* Obtiene la insignia del usuario logueado (para mostrar en el perfil) */
export const fetchMiInsignia = async (token) => {
  const res = await axios.get(`${API_BASE_URL}/api/users/insignia`, {
    headers: cabeceras(token),
  });
  return res.data;
};

/* ---- ESTADISTICAS DASHBOARD ---- */

/* Obtiene todas las estadisticas del sistema para el dashboard */
export const fetchEstadisticas = async (token) => {
  const res = await axios.get(`${ADMIN_URL}/insignias/estadisticas`, {
    headers: cabeceras(token),
  });
  return res.data;
};

/* ---- AUDITORIA DE PROYECTOS ---- */

/* Lista todos los proyectos de la plataforma */
export const fetchProyectosAdmin = async (token, { q = '', categoria = 'all', sort = 'recent' } = {}) => {
  const res = await axios.get(`${ADMIN_URL}/projects`, {
    headers: cabeceras(token),
    params: { q, categoria, sort },
  });
  return res.data.projects || [];
};

/* Elimina cualquier proyecto como administrador */
export const eliminarProyectoAdmin = async (token, proyectoId) => {
  const res = await axios.delete(`${ADMIN_URL}/projects/${proyectoId}`, {
    headers: cabeceras(token),
  });
  return res.data;
};
