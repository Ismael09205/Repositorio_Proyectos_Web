import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchComments, addComment, toggleCommentLike } from '../../services/projectService'
import { ThumbsUp, EyeOff, Eye, CornerUpLeft, Smile, AtSign, X } from 'lucide-react'
import './Comments.css'

const EMOJIS = [
  '😀', '😂', '😍', '🥰', '😎', '🤔', '😢', '😡',
  '👏', '🙌', '🔥', '💯', '🎉', '❤️', '💔', '😅',
  '😉', '🙏', '👀', '✨', '😱', '🤩', '😴', '🤯',
  '👌', '🤝', '😇', '🥳', '😤', '🤗', '😜', '💪'
]

export default function Comments({ projectId }) {
  const { user, token } = useAuth()
  const [comentarios, setComentarios] = useState([])
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [respondiendoA, setRespondiendoA] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [comentariosOcultos, setComentariosOcultos] = useState({})

  // Popovers de emoji y etiquetado
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const [mentionPickerOpen, setMentionPickerOpen] = useState(false)
  const inputRef = useRef(null)

  const cargarComentarios = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchComments(projectId, token)
      const ordenados = [...data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      setComentarios(ordenados)
    } catch (err) {
      console.error("Error al cargar comentarios:", err)
      setError("No se pudieron cargar los comentarios. Haz clic para reintentar.")
    } finally {
      setLoading(false)
    }
  }, [projectId, token])

  useEffect(() => {
    cargarComentarios()
  }, [cargarComentarios])

  const formatearFecha = (fechaStr) => {
    const ahora = new Date()
    const fecha = new Date(fechaStr)
    const diffMs = ahora - fecha

    const seg = Math.floor(diffMs / 1000)
    const min = Math.floor(seg / 60)
    const horas = Math.floor(min / 60)
    const dias = Math.floor(horas / 24)
    const semanas = Math.floor(dias / 7)

    if (seg < 1) return 'Ahora mismo'

    if (horas < 24) {
      if (horas >= 1) return `Hace ${horas}h`
      if (min >= 1) return `Hace ${min}m`
      return `Hace ${seg}s`
    }

    if (dias < 7) {
      return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`
    }

    if (dias >= 7 && dias < 14) {
      return `Hace ${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`
    }

    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const anio = fecha.getFullYear()
    return `${mes}-${anio}`
  }

  const handleEnviar = async (e) => {
    e.preventDefault()
    if (!nuevoComentario.trim()) return

    let textoFinal = nuevoComentario
    if (respondiendoA) {
      textoFinal = `@${respondiendoA.username} > ${nuevoComentario}`
    }

    const padreId = respondiendoA ? respondiendoA.rootId : null

    try {
      const nuevo = await addComment(token, projectId, textoFinal, padreId)
      setComentarios(prev => [...prev, nuevo])
      setNuevoComentario('')
      setRespondiendoA(null)
      setEmojiPickerOpen(false)
      setMentionPickerOpen(false)
    } catch (err) {
      alert('Inicia sesión para poder comentar.')
    }
  }

  const handleLike = async (commentId) => {
    if (!token) {
      alert("Inicia sesión para dar Like.")
      return
    }
    try {
      const res = await toggleCommentLike(token, projectId, commentId)
      setComentarios(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            likes_count: res.likes_count,
            ha_dado_like: res.liked
          }
        }
        return c
      }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleOcultar = (commentId) => {
    setComentariosOcultos(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }))
  }

  const getInitials = (username) => {
    if (!username) return 'US'
    return username.slice(0, 2).toUpperCase()
  }

  // Inserta texto (emoji o @mención) en la posición del cursor del input
  const insertarEnInput = (texto) => {
    const inputEl = inputRef.current
    if (!inputEl) {
      setNuevoComentario(prev => prev + texto)
      return
    }
    const inicio = inputEl.selectionStart ?? nuevoComentario.length
    const fin = inputEl.selectionEnd ?? nuevoComentario.length
    const nuevoTexto = nuevoComentario.slice(0, inicio) + texto + nuevoComentario.slice(fin)
    setNuevoComentario(nuevoTexto)

    requestAnimationFrame(() => {
      inputEl.focus()
      const nuevaPosicion = inicio + texto.length
      inputEl.setSelectionRange(nuevaPosicion, nuevaPosicion)
    })
  }

  const handleSeleccionarEmoji = (emoji) => {
    insertarEnInput(emoji)
    setEmojiPickerOpen(false)
  }

  const handleSeleccionarMencion = (username) => {
    insertarEnInput(`@${username} `)
    setMentionPickerOpen(false)
  }

  // Lista de usuarios únicos que han comentado (para etiquetar), sin incluir al usuario actual
  const usuariosParaEtiquetar = Array.from(
    new Map(
      comentarios
        .filter(c => c.profiles?.username && c.profiles.username !== user?.username)
        .map(c => [c.profiles.username, c.profiles])
    ).values()
  )

  // Renderiza el contenido del comentario, separando mención (línea superior) del mensaje
  // Renderiza el contenido del comentario, mostrando "AutorComentario > Mencionado" arriba
const renderContenido = (text, autorUsername) => {
  if (text.startsWith('@') && text.includes(' > ')) {
    const partes = text.split(' > ')
    const mencionado = partes[0].replace('@', '')
    const mensaje = partes.slice(1).join(' > ')

    return (
      <>
        <span className="tk-comment-mention-line">
          {autorUsername} <span className="tk-comment-mention-arrow">▶</span> {mencionado}
        </span>
        <p className="tk-comment-node__text">{mensaje}</p>
      </>
    )
  }
  return <p className="tk-comment-node__text">{text}</p>
}

  const renderAvatar = (profile, esReply = false) => {
    if (profile?.avatar_url) {
      return (
        <img
          src={profile.avatar_url}
          alt={profile.username || 'Usuario'}
          className="tk-comment-node__avatar-img"
        />
      )
    }
    return getInitials(profile?.username)
  }

  const roots = comentarios.filter(c => !c.padre_id)
  const getReplies = (parentId) => comentarios.filter(c => c.padre_id === parentId)

  return (
    <div className="tk-comments">
      <h3 className="tk-comments__title">Comentarios ({comentarios.length})</h3>

      <div className="tk-comments__scroll-area">
        <div className="tk-comments__list">
        {loading && <p className="tk-comments__status">Cargando conversación...</p>}
        {error && (
          <p className="tk-comments__status tk-comments__error" onClick={cargarComentarios}>
            {error}
          </p>
        )}
        {!loading && !error && comentarios.length === 0 && (
          <p className="tk-comments__status">No hay comentarios aún. ¡Sé el primero!</p>
        )}

        {!loading && roots.map(root => {
          const respuestas = getReplies(root.id)
          const estaOculto = comentariosOcultos[root.id]

          return (
            <div key={root.id} className="tk-comment-thread">

              {/* Comentario Padre */}
              <div className="tk-comment-node">
                <div className="tk-comment-node__avatar">
                  {renderAvatar(root.profiles)}
                </div>
                <div className="tk-comment-node__content">

                  {estaOculto ? (
                    <div className="tk-comment-node__bubble tk-comment-node__bubble--hidden">
                      <p className="tk-comment-node__text-hidden">Comentario ocultado</p>
                    </div>
                  ) : (
                    <div className="tk-comment-node__bubble">
                      <div className="tk-comment-node__header">
                        <span className="tk-comment-node__user">{root.profiles?.username || 'Usuario'}</span>
                        <span className="tk-comment-node__date">{formatearFecha(root.created_at)}</span>
                      </div>
                      {renderContenido(root.contenido, root.profiles?.username || 'Usuario')}
                    </div>
                  )}

                  <div className="tk-comment-node__actions">
                    {!estaOculto && (
                      <button
                        className="tk-comment-node__reply-btn"
                        onClick={() => setRespondiendoA({ username: root.profiles?.username || 'Usuario', rootId: root.id })}
                      >
                        <CornerUpLeft size={13} /> Responder
                      </button>
                    )}

                    <button
                      className={`tk-comment-action-btn tk-like-btn ${root.ha_dado_like ? 'active' : ''}`}
                      onClick={() => handleLike(root.id)}
                    >
                      <ThumbsUp size={14} fill={root.ha_dado_like ? 'currentColor' : 'none'} />
                      {root.likes_count || 0}
                    </button>

                    <button
                      className={`tk-comment-action-btn tk-dislike-btn ${estaOculto ? 'active-hidden' : ''}`}
                      onClick={() => handleToggleOcultar(root.id)}
                    >
                      {estaOculto ? <Eye size={14} /> : <EyeOff size={14} />}
                      {estaOculto ? 'Mostrar' : 'Ocultar'}
                    </button>
                  </div>

                </div>
              </div>

              {/* Contenedor de Respuestas */}
              {respuestas.length > 0 && (
                <div className="tk-replies-container">
                  {respuestas.map(reply => {
                    const replyOculto = comentariosOcultos[reply.id]
                    return (
                      <div key={reply.id} className="tk-comment-node tk-comment-node--reply">
                        <div className="tk-comment-node__avatar">
                          {renderAvatar(reply.profiles, true)}
                        </div>
                        <div className="tk-comment-node__content">

                          {replyOculto ? (
                            <div className="tk-comment-node__bubble tk-comment-node__bubble--hidden">
                              <p className="tk-comment-node__text-hidden">Comentario ocultado</p>
                            </div>
                          ) : (
                            <div className="tk-comment-node__bubble">
                              {renderContenido(reply.contenido, reply.profiles?.username || 'Usuario')}
                            </div>
                          )}

                          <div className="tk-comment-node__actions">
                            <span className="tk-comment-node__date">{formatearFecha(reply.created_at)}</span>
                            {!replyOculto && (
                              <button
                                className="tk-comment-node__reply-btn"
                                onClick={() => setRespondiendoA({ username: reply.profiles?.username || 'Usuario', rootId: root.id })}
                              >
                                <CornerUpLeft size={13} /> Responder
                              </button>
                            )}

                            <button
                              className={`tk-comment-action-btn tk-like-btn ${reply.ha_dado_like ? 'active' : ''}`}
                              onClick={() => handleLike(reply.id)}
                            >
                              <ThumbsUp size={14} fill={reply.ha_dado_like ? 'currentColor' : 'none'} />
                              {reply.likes_count || 0}
                            </button>

                            <button
                              className={`tk-comment-action-btn tk-dislike-btn ${replyOculto ? 'active-hidden' : ''}`}
                              onClick={() => handleToggleOcultar(reply.id)}
                            >
                              {replyOculto ? <Eye size={14} /> : <EyeOff size={14} />}
                              {replyOculto ? 'Mostrar' : 'Ocultar'}
                            </button>
                          </div>

                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

            </div>
          )
        })}
      </div>
      </div>

      {/* Input de comentarios */}
      <form className="tk-comments__footer" onSubmit={handleEnviar}>
        {respondiendoA && (
          <div className="tk-reply-indicator">
            <span>Respondiendo a <strong>@{respondiendoA.username}</strong></span>
            <button type="button" className="tk-reply-indicator__close" onClick={() => setRespondiendoA(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Popover de emojis */}
        {emojiPickerOpen && (
          <div className="tk-emoji-popover">
            {EMOJIS.map((emoji, idx) => (
              <button
                type="button"
                key={idx}
                className="tk-emoji-popover__item"
                onClick={() => handleSeleccionarEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Popover de etiquetar usuario */}
        {mentionPickerOpen && (
          <div className="tk-mention-popover">
            {usuariosParaEtiquetar.length > 0 ? (
              usuariosParaEtiquetar.map((profile, idx) => (
                <button
                  type="button"
                  key={idx}
                  className="tk-mention-popover__item"
                  onClick={() => handleSeleccionarMencion(profile.username)}
                >
                  <span className="tk-mention-popover__avatar">
                    {renderAvatar(profile)}
                  </span>
                  {profile.username}
                </button>
              ))
            ) : (
              <p className="tk-mention-popover__empty">No hay usuarios para etiquetar aún.</p>
            )}
          </div>
        )}

        <div className="tk-comments__input-group">
          <button
            type="button"
            className="tk-comments__icon-btn"
            onClick={() => { setEmojiPickerOpen(prev => !prev); setMentionPickerOpen(false) }}
            aria-label="Insertar emoji"
          >
            <Smile size={20} />
          </button>

          <button
            type="button"
            className="tk-comments__icon-btn"
            onClick={() => { setMentionPickerOpen(prev => !prev); setEmojiPickerOpen(false) }}
            aria-label="Etiquetar usuario"
          >
            <AtSign size={20} />
          </button>

          <input
            ref={inputRef}
            className="tk-comments__input"
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            onFocus={() => { setEmojiPickerOpen(false); setMentionPickerOpen(false) }}
            placeholder="Escribe un comentario..."
          />
          <button className="tk-comments__submit-btn" type="submit">Enviar</button>
        </div>
      </form>
    </div>
  )
}