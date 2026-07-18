// frontend/src/services/iaService.js
import axios from 'axios'; 
import API_BASE_URL from './apiConfig'; 

/**
 * Envía el mensaje del usuario al backend para consultar a Qwen 2.5
 * @param {string} mensaje - El texto que escribe el estudiante
 */
export const consultarAsistenteIA = async (mensaje) => {
  try {
    const urlFinal = `${API_BASE_URL}/api/ia/consultar`; 
    
    const response = await axios.post(urlFinal, { mensaje });
    
    // Retorna directamente el string con la respuesta simulada
    return response.data.respuesta; 
  } catch (error) {
    console.error("Error en el servicio de IA del frontend:", error);
    throw new Error(error.response?.data?.error || "No se pudo obtener respuesta de la IA.");
  }
};