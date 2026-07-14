import { useState, useEffect, useContext } from 'react'
import { Send, Loader } from 'lucide-react'
import { AuthContext } from '../../context/AuthContext'
import { fetchComments, addComment } from '../../services/projectService'
import toast from 'react-hot-toast'
import './Comments.css'

export default function Comments({ projectId }) {
  const { token, user } = useContext(AuthContext)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    loadComments()
  }, [projectId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const data = await fetchComments(projectId)
      setComments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading comments:', error)
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()

    if (!token || !user) {
      toast.error('Debes iniciar sesión para comentar')
      return
    }

    if (!newComment.trim()) {
      toast.error('El comentario no puede estar vacío')
      return
    }

    setSubmitting(true)
    try {
      const comment = await addComment(token, projectId, newComment)
      setComments([comment, ...comments])
      setNewComment('')
      toast.success('Comentario agregado exitosamente')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Error al agregar comentario')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Hace poco'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (id) => {
    if (!id) return 'U'
    return id.substring(0, 2).toUpperCase()
  }

  return (
    <div className="comments">
      <h3 className="comments__title">Comentarios ({comments.length})</h3>

      {/* Comment form */}
      {token && user && (
        <form className="comments__form" onSubmit={handleSubmitComment}>
          <div className="comments__input-wrapper">
            <textarea
              className="comments__input"
              placeholder="Comparte tu opinión sobre este proyecto..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows="3"
              disabled={submitting}
            />
          </div>
          <button
            type="submit"
            className="comments__submit-btn"
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? (
              <>
                <Loader size={16} className="animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send size={16} />
                Comentar
              </>
            )}
          </button>
        </form>
      )}

      {!token && (
        <div className="comments__login-prompt">
          <p>Inicia sesión para comentar en este proyecto</p>
        </div>
      )}

      {/* Comments list */}
      <div className="comments__list">
        {loading ? (
          <div className="comments__loading">
            <Loader size={24} className="animate-spin" />
            <p>Cargando comentarios...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="comments__empty">
            <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comments__item">
              <div className="comments__item-header">
                <div className="comments__item-avatar">
                  {getInitials(comment.usuario_id)}
                </div>
                <div className="comments__item-meta">
                  <span className="comments__item-author">
                    Usuario
                  </span>
                  <span className="comments__item-date">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
              </div>
              <p className="comments__item-content">{comment.contenido}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

