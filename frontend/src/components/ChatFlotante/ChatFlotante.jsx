import React, { useState } from "react";
import { createPortal } from "react-dom"; // 1. Importa esto
import { consultarAsistenteIA } from "../../services/iaService.js"; 
import enviar from "../../assets/enviar.svg";
import "./ChatFlotante.css";

export const ChatFlotante = () => {
  const [activo, setActivo] = useState(false);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajes, setMensajes] = useState([
    { id: 1, remitente: 'ia', texto: '¡Hola! Soy IdeAbot. ¿En que te puedo ayudar?' }
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
          <div className="chat-ia-header">IdeAbot</div>
          
          <div className="chat-ia-mensajes">
            {mensajes.map((m) => (
              <div key={m.id} className={`burbuja-msg ${m.remitente}`}>
                <p>{m.texto}</p>
              </div>
            ))}
            {cargando && <div className="burbuja-msg ia cargando">...</div>}
          </div>

          <form onSubmit={manejarEnvio} className="chat-ia-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntame..."
              disabled={cargando}
            />
            <button type="submit" disabled={cargando}>
              <img src={enviar} class = "icon-enviar" alt="icono-enviar" />
            </button>
          </form>
        </div>
      )}

      {/* Botón flotante */}
      <button className={`boton-flotante ${activo ? 'abierto' : ''}`} onClick={toggleChat}>
        +
      </button>
    </div>,
    document.body
  );
};