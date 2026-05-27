import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, Menu, X, ChevronDown, Bell, BookOpen, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import logoPoli from '../../assets/logo.png'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)
  const searchRef = useRef(null)

  // Extraemos el nombre real mapeando la metadata de Supabase o las propiedades del contexto
  const displayNombre = user?.user_metadata?.nombre_completo || user?.name || "Estudiante";
  const displayEmail = user?.email || "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClickOut = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', onClickOut)
    return () => document.removeEventListener('mousedown', onClickOut)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchVal.trim()) navigate(`/explorar?q=${encodeURIComponent(searchVal.trim())}`)
    setSearchOpen(false)
  }

  const handleLogout = () => {
    logout()
    setDropOpen(false)
    navigate('/')
  }

  const generateInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(word => word[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          
          
          
          <img src={logoPoli} alt="Logo PoliConnect" className="logo-image" />
          <span className="navbar__logo-text">poli<strong>connect</strong></span>
        </Link>

        {/* Nav links (desktop) */}
        <nav className="navbar__links">
          <NavLink to="/" className={({isActive}) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'} end>
            Inicio
          </NavLink>
          <NavLink to="/explorar" className={({isActive}) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
            Explorar
          </NavLink>
          <NavLink to="/categorias" className={({isActive}) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
            Categorías
          </NavLink>
          <NavLink to="/blog" className={({isActive}) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
            Blog
          </NavLink>
          <NavLink to="/nosotros" className={({isActive}) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
            Sobre nosotros
          </NavLink>
        </nav>

        {/* Right actions */}
        <div className="navbar__actions">
          {/* Search toggle */}
          <button
            className="navbar__icon-btn"
            onClick={() => { setSearchOpen(s => !s); setTimeout(() => searchRef.current?.focus(), 50) }}
            aria-label="Buscar"
          >
            <Search size={18} />
          </button>

          {user ? (
            <>
              <button className="navbar__icon-btn">
                <Bell size={18} />
                <span className="navbar__notif-dot" />
              </button>

              {/* User dropdown */}
              <div className="navbar__user-menu" ref={dropRef}>
                <button className="navbar__avatar-btn" onClick={() => setDropOpen(d => !d)}>
                  <div className="navbar__avatar">
                    {generateInitials(displayNombre)}
                  </div>
                  <span className="navbar__username">
                    {displayNombre.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className={dropOpen ? 'rotated' : ''} />
                </button>

                {dropOpen && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-header">
                      <div className="navbar__avatar navbar__avatar--lg">
                        {generateInitials(displayNombre)}
                      </div>
                      <div>
                        <p className="navbar__dd-name">{displayNombre}</p>
                        <p className="navbar__dd-email">{displayEmail}</p>
                      </div>
                    </div>
                    <div className="navbar__dropdown-divider" />
                    <Link to="/perfil" className="navbar__dd-item" onClick={() => setDropOpen(false)}>
                      <User size={15} /> Mi perfil
                    </Link>
                    <Link to="/workspace" className="navbar__dd-item" onClick={() => setDropOpen(false)}>
                      <BookOpen size={15} /> Mis proyectos
                    </Link>
                    <Link to="/configuracion" className="navbar__dd-item" onClick={() => setDropOpen(false)}>
                      <Settings size={15} /> Configuración
                    </Link>
                    <div className="navbar__dropdown-divider" />
                    <button className="navbar__dd-item navbar__dd-item--danger" onClick={handleLogout}>
                      <LogOut size={15} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost navbar__login-btn">Iniciar Sesión</Link>
              <Link to="/register" className="btn btn-accent">Registrarse</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(m => !m)}
            aria-label="Menú"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="navbar__search-overlay">
          <form onSubmit={handleSearch} className="navbar__search-form container">
            <Search size={18} className="navbar__search-icon" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar proyectos por título, tecnología, carrera..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className="navbar__search-input"
            />
            <button type="button" className="navbar__icon-btn" onClick={() => setSearchOpen(false)}>
              <X size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu">
          <nav className="container">
            {['/', '/explorar', '/categorias', '/blog', '/nosotros'].map((path, i) => (
              <NavLink
                key={i}
                to={path}
                className="navbar__mobile-link"
                onClick={() => setMenuOpen(false)}
                end={path === '/'}
              >
                {['Inicio', 'Explorar', 'Categorías', 'Blog', 'Sobre nosotros'][i]}
              </NavLink>
            ))}
            {!user && (
              <div className="navbar__mobile-auth">
                <Link to="/login" className="btn btn-outline" onClick={() => setMenuOpen(false)}>Iniciar Sesión</Link>
                <Link to="/register" className="btn btn-accent" onClick={() => setMenuOpen(false)}>Registrarse</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}