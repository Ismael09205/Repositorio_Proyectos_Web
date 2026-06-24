import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Sparkles, TrendingUp, Users } from 'lucide-react'
import { POPULAR_TAGS } from '../../services/mockData'
import './Hero.css'

const STATS = [
  { icon: TrendingUp, value: '1,200+', label: 'Proyectos' },
  { icon: Users, value: '3,800+', label: 'Estudiantes' },
  { icon: Sparkles, value: '45+', label: 'Universidades' },
]

export default function Hero() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/explorar?q=${encodeURIComponent(query.trim())}`)
    else navigate('/explorar')
  }

  return (
    <section className="hero">
      {/* Decorative blobs */}
      <div className="hero__blob hero__blob--1" />
      <div className="hero__blob hero__blob--2" />

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

        {/* Right: Illustration */}
        <div className="hero__illustration">
          <div className="hero__illus-card hero__illus-card--main">
            <IllustrationSVG />
          </div>
          {/* Floating badges */}
          <div className="hero__float hero__float--1">
            <span>📚</span> +12 proyectos hoy
          </div>
          <div className="hero__float hero__float--2">
            <span>🏆</span> Mejor proyecto IA
          </div>
        </div>
      </div>
    </section>
  )
}

function IllustrationSVG() {
  return (
    <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero__svg">
      {/* Books stack */}
      <rect x="90" y="160" width="140" height="18" rx="4" fill="#1a0e82" opacity=".9"/>
      <rect x="100" y="144" width="120" height="18" rx="4" fill="#f97316"/>
      <rect x="95" y="128" width="130" height="18" rx="4" fill="#fbbf24"/>
      <rect x="105" y="112" width="110" height="18" rx="4" fill="#1a0e82" opacity=".7"/>
      <rect x="115" y="96" width="90" height="18" rx="4" fill="#e0e7ff"/>

      {/* Magnifying glass */}
      <circle cx="240" cy="90" r="32" fill="none" stroke="#1a0e82" strokeWidth="6"/>
      <circle cx="240" cy="90" r="22" fill="#e0e7ff" opacity=".6"/>
      <line x1="263" y1="113" x2="282" y2="135" stroke="#1a0e82" strokeWidth="6" strokeLinecap="round"/>

      {/* Person sitting on books */}
      <circle cx="175" cy="82" r="16" fill="#fbbf24"/>
      <rect x="155" y="96" width="40" height="32" rx="8" fill="#1a0e82"/>
      <rect x="145" y="108" width="18" height="8" rx="4" fill="#1a0e82"/>
      <rect x="157" y="126" width="12" height="28" rx="4" fill="#1a0e82" opacity=".8"/>
      <rect x="173" y="126" width="12" height="28" rx="4" fill="#1a0e82" opacity=".8"/>

      {/* Laptop on lap */}
      <rect x="150" y="108" width="50" height="30" rx="4" fill="#334155"/>
      <rect x="153" y="111" width="44" height="22" rx="2" fill="#38bdf8" opacity=".6"/>
      <rect x="145" y="138" width="60" height="4" rx="2" fill="#475569"/>

      {/* Stars / sparkles */}
      <circle cx="70" cy="70" r="4" fill="#f97316" opacity=".7"/>
      <circle cx="270" cy="160" r="3" fill="#7c3aed" opacity=".6"/>
      <circle cx="55" cy="140" r="3" fill="#1a0e82" opacity=".4"/>
      <circle cx="285" cy="55" r="5" fill="#fbbf24" opacity=".8"/>

      {/* Decorative lines */}
      <path d="M50 180 Q80 160 110 180" stroke="#e2e5f1" strokeWidth="2" fill="none"/>
      <path d="M230 180 Q260 165 280 180" stroke="#e2e5f1" strokeWidth="2" fill="none"/>

      {/* Text label on book */}
      <rect x="102" y="148" width="60" height="8" rx="2" fill="rgba(255,255,255,.5)"/>
      <text x="132" y="155" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">LIBRARY</text>
    </svg>
  )
}