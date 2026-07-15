import React, { useState } from "react";
import { createPortal } from "react-dom"; // 1. Importa esto
import { consultarAsistenteIA } from "../../services/iaService.js"; 
import "./ChatFlotante.css";

export const ChatFlotante = () => {
  const [activo, setActivo] = useState(false);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajes, setMensajes] = useState([
    { id: 1, remitente: 'ia', texto: '¡Hola! Soy tu asistente de repositorio. ¿Qué tesis o documentación técnica buscas hoy?' }
  ]);

  const toggleChat = () => setActivo(!activo);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!input.trim() || cargando) return;

    const nuevoMensajeUsuario = { id: Date.now(), remitente: 'usuario', texto: input.trim() };
    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    setInput('');
    setCargando(true);

    try {
      const data = await consultarAsistenteIA(nuevoMensajeUsuario.texto);
      setMensajes((prev) => [...prev, { id: Date.now() + 1, remitente: 'ia', texto: data }]);
    } catch (error) {
      setMensajes((prev) => [...prev, { id: Date.now() + 1, remitente: 'ia', texto: 'Ocurrió un error al procesar tu consulta con Qwen.' }]);
    } finally {
      setCargando(false);
    }
  };

  // 2. Envolvemos el JSX en un Portal que apunta directamente al body del HTML
  return createPortal(
    <div className="chat-flotante-container">
      {/* Ventana del Chat */}
      {activo && (
        <div className="ventana-chat-ia">
          <div className="chat-ia-header">Asistente Politécnico (IA)</div>
          
          <div className="chat-ia-mensajes">
            {mensajes.map((m) => (
              <div key={m.id} className={`burbuja-msg ${m.remitente}`}>
                <p>{m.texto}</p>
              </div>
            ))}
            {cargando && <div className="burbuja-msg ia cargando">Buscando tesis...</div>}
          </div>

          <form onSubmit={manejarEnvio} className="chat-ia-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntame sobre un proyecto..."
              disabled={cargando}
            />
            <button type="submit" disabled={cargando}>➡️</button>
          </form>
        </div>
      )}

      {/* Botón flotante */}
      <button className={`boton-flotante ${activo ? 'abierto' : ''}`} onClick={toggleChat}>
        +
      </button>
    </div>,
    document.body // <-- Esto lo manda a la raíz del HTML, libre de toda restricción
  );
};