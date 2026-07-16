import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Search, MessageCircle, ArrowLeft, Loader } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { io } from 'socket.io-client'
import './Chat.css'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Chat() {
    const { user, token, loading } = useAuth()
    const navigate = useNavigate()

    const [socket, setSocket] = useState(null)
    const [conversaciones, setConversaciones] = useState([])
    const [conversacionActiva, setConversacionActiva] = useState(null)
    const [mensajes, setMensajes] = useState([])
    const [textoMensaje, setTextoMensaje] = useState('')
    const [busqueda, setBusqueda] = useState('');
    const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
    const [cargando, setCargando] = useState(true)
    const [enviando, setEnviando] = useState(false)
    const [vistaMovil, setVistaMovil] = useState('lista')
    
    // Estado para guardar la lista de IDs de usuarios conectados actualmente
    const [usuariosOnline, setUsuariosOnline] = useState([])

    const mensajesEndRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        if (loading) return;
        if (!user || !token) {
            navigate('/login', { replace: true })
        }
    }, [user, token, loading, navigate])

    useEffect(() => {
        if (!token) return

        const nuevoSocket = io(BACKEND_URL, {
            auth: { token },
        })

        nuevoSocket.on('connect', () => {
            console.log('Conectado al servidor de chat')
        })

        nuevoSocket.on('connect_error', (err) => {
            console.error('Error de conexión WebSocket:', err.message)
        })

        nuevoSocket.on('nuevo_mensaje', (mensaje) => {
            setMensajes(prev => [...prev, mensaje])
        })

        nuevoSocket.on('conversacion_actualizada', ({ conversacion_id, ultimo_mensaje }) => {
            setConversaciones(prev =>
                prev.map(conv =>
                    conv.id === conversacion_id
                        ? { ...conv, ultimo_mensaje, updated_at: ultimo_mensaje.created_at }
                        : conv
                ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            )
        })

        nuevoSocket.on('historial_mensajes', ({ mensajes }) => {
            setMensajes(mensajes)
            setCargando(false)
        })

        // Escuchar los usuarios conectados que envíe el servidor Socket.io
        nuevoSocket.on('usuarios_online', (idsOnline) => {
            setUsuariosOnline(idsOnline || [])
        })

        nuevoSocket.on('error_chat', ({ mensaje }) => {
            console.error('Error del chat:', mensaje)
        })

        setSocket(nuevoSocket)

        return () => {
            nuevoSocket.disconnect()
        }
    }, [token])

    useEffect(() => {
    if (loading || !token) return;

    const obtenerConversaciones = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/chat/conversaciones`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            
            if (res.status === 401) {
                console.warn("Token inválido o expirado.");
                return;
            }

            const data = await res.json()
            console.log("Conversaciones recibidas del backend:", data.conversaciones)
            setConversaciones(data.conversaciones || [])
        } catch (error) {
            console.error('Error obteniendo conversaciones:', error)
        } finally {
            setCargando(false)
        }
    }

    obtenerConversaciones()
}, [token, loading])

    useEffect(() => {
        mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [mensajes])

    const abrirConversacion = (conversacion) => {
        if (conversacionActiva?.id === conversacion.id) return

        if (conversacionActiva && socket) {
            socket.emit('salir_conversacion', { conversacion_id: conversacionActiva.id })
        }

        setCargando(true)
        setConversacionActiva(conversacion)
        setVistaMovil('chat')

        if (socket) {
            socket.emit('unirse_conversacion', { conversacion_id: conversacion.id })
        }

        setTimeout(() => inputRef.current?.focus(), 100)
    }

    const volverALista = () => {
        if (conversacionActiva && socket) {
            socket.emit('salir_conversacion', { conversacion_id: conversacionActiva.id })
        }
        setConversacionActiva(null)
        setMensajes([])
        setVistaMovil('lista')
    }

    const enviarMensaje = (e) => {
        e.preventDefault()

        if (!textoMensaje.trim() || !conversacionActiva || !socket || enviando) return

        const receptorId = obtenerReceptorId(conversacionActiva)

        setEnviando(true)
        socket.emit('enviar_mensaje', {
            conversacion_id: conversacionActiva.id,
            receptor_id: receptorId,
            contenido: textoMensaje.trim(),
        })

        setTextoMensaje('')
        setEnviando(false)
        inputRef.current?.focus()
    }

    const obtenerOtroParticipante = (conversacion) => {
        const miId = user?.auth?.id || user?.auth?.user?.id
        if (conversacion.usuario_a === miId) {
            return conversacion.perfil_b
        }
        return conversacion.perfil_a
    }

    const obtenerReceptorId = (conversacion) => {
        const miId = user?.auth?.id || user?.auth?.user?.id
        return conversacion.usuario_a === miId ? conversacion.usuario_b : conversacion.usuario_a
    }

    const obtenerInicialesNombre = (nombre) => {
        if (!nombre) return '?'
        return nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
    }

    const formatearHora = (fechaStr) => {
        if (!fechaStr) return ''
        const fecha = new Date(fechaStr)
        return fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
    }

    const miId = user?.auth?.id || user?.auth?.user?.id

    const manejarBusqueda = async (e) => {
        const texto = e.target.value;
        setBusqueda(texto);

        if (texto.trim().length > 2) {
            try {
                const res = await fetch(`${BACKEND_URL}/api/chat/buscar-usuarios?q=${texto}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setUsuariosEncontrados(data.usuarios || []);
            } catch (error) {
                console.error("Error buscando usuarios:", error);
            }
        } else {
            setUsuariosEncontrados([]);
        }
    };

    const iniciarNuevaConversacion = async (usuarioId) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/chat/conversaciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ receptor_id: usuarioId })
            });
            const data = await res.json();

            if (data.conversacion) {
                abrirConversacion(data.conversacion);
                setBusqueda('');
                setUsuariosEncontrados([]);
            }
        } catch (error) {
            console.error("Error iniciando nueva conversación:", error);
        }
    };

    // ────────────────────────────────────────────────────────
    // SOLUCIÓN A LOS DUPLICADOS: Filtrar conversaciones únicas por ID de usuario
    // ────────────────────────────────────────────────────────
    const conversacionesUnicas = (() => {
        const guardados = new Set()
        return conversaciones.filter(conv => {
            const otro = obtenerOtroParticipante(conv)
            if (!otro || !otro.id) return true // Mantenemos chats raros por si acaso
            if (guardados.has(otro.id)) {
                return false // Ignora si ya listamos a este usuario
            }
            guardados.add(otro.id)
            return true
        })
    })()

    // Variable para verificar si el usuario activo en la ventana está online
    const elOtroActivo = conversacionActiva ? obtenerOtroParticipante(conversacionActiva) : null
    const estaEnLineaActivo = elOtroActivo && (usuariosOnline.includes(elOtroActivo.id) || usuariosOnline.includes(obtenerReceptorId(conversacionActiva)))

    return (
        <div className="chat-page">
            <aside className={`chat-sidebar ${vistaMovil === 'chat' ? 'chat-sidebar--oculto' : ''}`}>
                <div className="chat-sidebar__header">
                    <h2 className="chat-sidebar__titulo">Mensajes</h2>
                </div>

                <div className="chat-sidebar__buscador">
                    <Search size={15} className="chat-sidebar__search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar compañero..."
                        className="chat-sidebar__search-input"
                        value={busqueda}
                        onChange={manejarBusqueda}
                    />
                </div>

                <div className="chat-sidebar__lista">
                    {busqueda.trim().length > 0 ? (
                        usuariosEncontrados.length > 0 ? (
                            usuariosEncontrados.map(u => {
                                const isOnline = usuariosOnline.includes(u.id);
                                return (
                                    <button
                                        key={u.id}
                                        className="chat-conv-item"
                                        onClick={() => iniciarNuevaConversacion(u.id)}
                                    >
                                        <div className="chat-conv-item__avatar-wrapper">
                                            {u.avatar_url ? (
                                                <img src={u.avatar_url} alt={u.nombre_completo} className="chat-conv-item__avatar-img" />
                                            ) : (
                                                <div className="chat-conv-item__avatar-initials">
                                                    {obtenerInicialesNombre(u.nombre_completo || u.nombre_usuario)}
                                                </div>
                                            )}
                                            {isOnline && <span className="chat-online-badge" />}
                                        </div>
                                        <div className="chat-conv-item__info">
                                            <span className="chat-conv-item__nombre">
                                                {u.nombre_completo || u.nombre_usuario || 'Usuario'}
                                            </span>
                                            <span className="chat-conv-item__preview">
                                                @{u.nombre_usuario}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="chat-sidebar__vacio">
                                <Search size={32} />
                                <p>No se encontraron compañeros</p>
                            </div>
                        )
                    ) : (
                        cargando && conversacionesUnicas.length === 0 ? (
                            <div className="chat-sidebar__vacio">
                                <Loader size={20} className="chat-loading-icon" />
                            </div>
                        ) : conversacionesUnicas.length === 0 ? (
                            <div className="chat-sidebar__vacio">
                                <MessageCircle size={32} />
                                <p>Aún no tienes conversaciones</p>
                            </div>
                        ) : (
                            conversacionesUnicas.map(conv => {
                                const otro = obtenerOtroParticipante(conv)
                                const activa = conversacionActiva?.id === conv.id
                                const receptorId = obtenerReceptorId(conv)
                                const isOnline = otro && (usuariosOnline.includes(otro.id) || usuariosOnline.includes(receptorId))

                                return (
                                    <button
                                        key={conv.id}
                                        className={`chat-conv-item ${activa ? 'chat-conv-item--activa' : ''}`}
                                        onClick={() => abrirConversacion(conv)}
                                    >
                                        <div className="chat-conv-item__avatar-wrapper">
                                            {otro?.avatar_url ? (
                                                <img src={otro.avatar_url} alt={otro.nombre_completo} className="chat-conv-item__avatar-img" />
                                            ) : (
                                                <div className="chat-conv-item__avatar-initials">
                                                    {obtenerInicialesNombre(otro?.nombre_completo || otro?.nombre_usuario)}
                                                </div>
                                            )}
                                            {isOnline && <span className="chat-online-badge" />}
                                        </div>
                                        <div className="chat-conv-item__info">
                                            <span className="chat-conv-item__nombre">
                                                {otro?.nombre_completo || otro?.nombre_usuario || 'Usuario'}
                                            </span>
                                            <span className="chat-conv-item__preview">
                                                {conv.ultimo_mensaje?.contenido || 'Inicia la conversación'}
                                            </span>
                                        </div>
                                        <span className="chat-conv-item__hora">
                                            {formatearHora(conv.updated_at)}
                                        </span>
                                    </button>
                                )
                            })
                        )
                    )}
                </div>
            </aside>

            <main className={`chat-ventana ${vistaMovil === 'lista' ? 'chat-ventana--oculta' : ''}`}>
                {!conversacionActiva ? (
                    <div className="chat-ventana__vacio">
                        <div className="chat-ventana__vacio-icon">
                            <MessageCircle size={56} />
                        </div>
                        <h3>Selecciona una conversación</h3>
                        <p>Elige un chat de la lista para empezar a hablar en IdeAgora</p>
                    </div>
                ) : (
                    <>
                        <div className="chat-ventana__header">
                            <button className="chat-ventana__back-btn" onClick={volverALista}>
                                <ArrowLeft size={18} />
                            </button>
                            <div className="chat-ventana__header-avatar-wrapper">
                                {elOtroActivo?.avatar_url ? (
                                    <img src={elOtroActivo.avatar_url} alt="Profile" className="chat-ventana__header-avatar-img" />
                                ) : (
                                    <div className="chat-ventana__header-avatar-initials">
                                        {obtenerInicialesNombre(
                                            elOtroActivo?.nombre_completo || elOtroActivo?.nombre_usuario
                                        )}
                                    </div>
                                )}
                                {estaEnLineaActivo && <span className="chat-online-badge chat-online-badge--header" />}
                            </div>
                            <div className="chat-ventana__header-info">
                                <span className="chat-ventana__header-nombre">
                                    {elOtroActivo?.nombre_completo || elOtroActivo?.nombre_usuario || 'Usuario'}
                                </span>
                                <span className={`chat-ventana__header-estado ${estaEnLineaActivo ? 'chat-ventana__header-estado--online' : 'chat-ventana__header-estado--offline'}`}>
                                    {estaEnLineaActivo ? 'En línea' : 'Desconectado'}
                                </span>
                            </div>
                        </div>

                        <div className="chat-ventana__mensajes">
                            {cargando ? (
                                <div className="chat-ventana__cargando">
                                    <Loader size={20} className="chat-loading-icon" />
                                </div>
                            ) : mensajes.length === 0 ? (
                                <div className="chat-ventana__sin-mensajes">
                                    <div className="chat-ventana__saludo-burbuja">
                                        <p>Sé el primero en escribir 👋</p>
                                    </div>
                                </div>
                            ) : (
                                mensajes.map((msg) => {
                                    const esMio = msg.emisor_id === miId
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`chat-mensaje ${esMio ? 'chat-mensaje--mio' : 'chat-mensaje--suyo'}`}
                                        >
                                            <div className="chat-mensaje__burbuja">
                                                <p className="chat-mensaje__texto">{msg.contenido}</p>
                                                <span className="chat-mensaje__hora">{formatearHora(msg.created_at)}</span>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={mensajesEndRef} />
                        </div>

                        <form className="chat-ventana__input-area" onSubmit={enviarMensaje}>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Escribe un mensaje..."
                                className="chat-ventana__input"
                                value={textoMensaje}
                                onChange={e => setTextoMensaje(e.target.value)}
                                disabled={enviando}
                            />
                            <button
                                type="submit"
                                className="chat-ventana__send-btn"
                                disabled={!textoMensaje.trim() || enviando}
                                aria-label="Enviar mensaje"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </>
                )}
            </main>
        </div>
    )
}