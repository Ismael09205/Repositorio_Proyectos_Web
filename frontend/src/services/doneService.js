import API_BASE_URL from './apiConfig.js'

const API_URL = `${API_BASE_URL}/api/payments`

export const doneService = {
  /**
   * Envía el monto seleccionado al backend para obtener la URL de Stripe Checkout.
   * @param {number|string} amount - El monto de la donación (ej: 10 o 15.50)
   * @returns {Promise<Object>} Objeto con la URL de redirección
   */
  createDonationSession: async (amount) => {
    try {
      const response = await fetch(`${API_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Aquí puedes agregar tokens de autenticación si en el futuro requieres que estén logueados
          // 'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la solicitud en el servidor.');
      }

      return data; // Retorna { url: "https://checkout.stripe.com/..." }
    } catch (error) {
      console.error('Error en doneService:', error);
      throw error;
    }
  },
};