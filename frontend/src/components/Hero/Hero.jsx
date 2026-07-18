import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Sparkles, TrendingUp, Users } from 'lucide-react'
import { POPULAR_TAGS } from '../../services/mockData'
import './Hero.css'

// Tus imágenes de assets ya importadas
import imagen1 from '../../assets/ambiente.webp'; 
import imagen2 from '../../assets/civil.jpg';
import imagen3 from '../../assets/petroleos.avif';
import imagen4 from '../../assets/sistemas.avif';

const STATS = [
  { icon: TrendingUp, value: '1,200+', label: 'Proyectos' },
  { icon: Users, value: '3,800+', label: 'Estudiantes' },
  { icon: Sparkles, value: '45+', label: 'Universidades' },
]

// Array con las imágenes para el carrusel
const HERO_IMAGES = [imagen1, imagen2, imagen3, imagen4];

export default function Hero() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Temporizador para cambiar la imagen cada 4 segundos de forma cíclica
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/explorar?q=${encodeURIComponent(query.trim())}`)
    else navigate('/explorar')
  }

  return (
    <section className="hero">


      <div className="hero__inner container">
        {/* Left: Text */}
        <div className="hero__text">
          <div className="hero__pill">
            <Sparkles size={12} />
            Plataforma #1 de proyectos universitarios
          </div>

          <h1 className="hero__heading">
            Explora proyectos<br />
            universitarios que<br />
            <span className="hero__highlight">inspiran el futuro</span>
          </h1>

          <p className="hero__subtext">
            Descubre, comparte y aprende de proyectos desarrollados
            por estudiantes del Ecuador.
          </p>

          {/* Search bar */}
          <form className="hero__search" onSubmit={handleSearch}>
            <Search size={18} className="hero__search-icon" />
            <input
              type="text"
              placeholder="Buscar proyectos por título, tecnología, carrera..."
              className="hero__search-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className="hero__search-btn">
              Buscar
            </button>
          </form>

          {/* Popular tags */}
          <div className="hero__tags">
            <span className="hero__tags-label">Búsquedas populares:</span>
            <div className="hero__tag-list">
              {POPULAR_TAGS.map(tag => (
                <button
                  key={tag}
                  className="hero__tag"
                  onClick={() => navigate(`/explorar?q=${encodeURIComponent(tag)}`)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="hero__stats">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="hero__stat">
                <div className="hero__stat-icon">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="hero__stat-value">{value}</p>
                  <p className="hero__stat-label">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Slider de Imágenes de Proyectos Reales */}
        <div className="hero__illustration">
          <div className="hero__illus-card hero__illus-card--main hero__slider-container">
            
            {/* Renderizado de imágenes con transición activa */}
            {HERO_IMAGES.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Proyecto universitario ${index + 1}`}
                className={`hero__slider-img ${
                  index === currentImageIndex ? 'hero__slider-img--active' : ''
                }`}
              />
            ))}
            
            {/* Máscara/Capa superior para difuminar los bordes hacia el fondo de la página */}
            <div className="hero__slider-overlay"></div>
          </div>
        </div>
      </div>
    </section>
  )
}