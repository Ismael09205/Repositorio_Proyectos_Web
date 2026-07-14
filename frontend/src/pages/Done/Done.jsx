import React, { useState } from 'react';
import { doneService } from '../../services/doneService'; // Ajusta los dos puntos '../' según tu nivel de carpetas
import './Done.css';

const Done = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickAmount = (value) => {
    if (loading) return;
    setAmount(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert("Por favor, ingresa un monto válido.");
      return;
    }

    setLoading(true);

    try {
      // Usamos el servicio que acabamos de crear
      const data = await doneService.createDonationSession(amount);
      
      if (data.url) {
        // Redirección inmediata y directa a la pasarela segura de Stripe
        window.location.href = data.url;
      } else {
        alert("No se recibió una URL de pago válida.");
        setLoading(false);
      }
    } catch (error) {
      alert(error.message || "Hubo un problema al conectar con el servidor.");
      setLoading(false);
    }
  };

  return (
    <main className="donation-page container">
      <div className="donation-card">
        <div className="donation-header">
          <h1 className="donation-title">Apoya a IdeAgora</h1>
          <p className="donation-subtitle">
            Tu contribución nos ayuda a mantener el repositorio académico activo y mejorar la plataforma.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="donation-form">
          {/* Botones de montos rápidos */}
          <div className="quick-amounts">
            {[5, 10, 20, 50].map((num) => (
              <button
                key={num}
                type="button"
                disabled={loading}
                className={`btn-quick ${parseFloat(amount) === num ? 'active' : ''}`}
                onClick={() => handleQuickAmount(num.toString())}
              >
                ${num}
              </button>
            ))}
          </div>

          {/* Input de monto personalizado */}
          <div className="form-group-donate">
            <label htmlFor="amount" className="donate-label">O ingresa un monto personalizado (USD):</label>
            <div className="input-donate-wrapper">
              <span className="donate-currency">$</span>
              <input
                type="number"
                id="amount"
                min="1"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-donate"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Botón de envío directo a Stripe */}
          <button 
            type="submit" 
            className="btn btn-done btn-block-donate" 
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Redirigiendo a Stripe...' : 'Donar'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default Done;