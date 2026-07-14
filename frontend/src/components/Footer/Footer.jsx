import { Link } from 'react-router-dom'
import logoPoliconnect from "../../assets/logo.png"
import './Footer.css'

const LINKS = {
  Plataforma: [
    { label: 'Inicio', to: '/' },
    { label: 'Explorar proyectos', to: '/explorar' },
    { label: 'Categorías', to: '/categorias' },
  ],
  Comunidad: [
    { label: 'Únete como autor', to: '/register' },
    { label: 'Iniciar sesión', to: '/login' },
    { label: 'Mi perfil', to: '/perfil' },
  ],
  Soporte: [
    { label: 'Recuperar contraseña', to: '/forgot-password' },
    { label: 'Registro', to: '/register' },
    { label: 'Iniciar sesión', to: '/login' },
    { label: 'Explorar', to: '/explorar' },
    { label: 'Inicio', to: '/' },
  ],
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__main container">
        {/* Brand */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            
            <img src={logoPoliconnect} alt="Logo Policonnect" className="logo-image"/>
            <span className="footer__logo-text">Ide<strong>Agora</strong></span>
          </Link>
          <p className="footer__tagline">
            Descubre, comparte y aprende de proyectos desarrollados por estudiantes del Ecuador.
          </p>

          {/* Newsletter */}
          <div className="footer__newsletter">
            <p className="footer__nl-label">Obtén lo mejor del contenido</p>
            <form className="footer__nl-form" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="Tu correo..."
                className="footer__nl-input"
                aria-label="Email para newsletter"
              />
              <button type="submit" className="btn btn-accent footer__nl-btn">
                Suscribir
              </button>
            </form>
          </div>
        </div>

        {/* Links */}
        {Object.entries(LINKS).map(([section, items]) => (
          <div key={section} className="footer__col">
            <h4 className="footer__col-title">{section}</h4>
            <ul className="footer__col-list">
              {items.map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="footer__col-link">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <div className="footer__legal">
            <Link to="/forgot-password">Recuperar contraseña</Link>
            <span>·</span>
            <Link to="/register">Registro</Link>
            <span>·</span>
            <Link to="/explorar">Explorar</Link>
          </div>

          <div className="footer__socials">
            {['GitHub', 'Twitter', 'LinkedIn', 'Email'].map((label, i) => (
              <a key={i} href="#" className="footer__social-btn" aria-label={label}>
                {label}
              </a>
            ))}
          </div>

          <p className="footer__copy">© Copyright 2026 IdeAgora</p>
        </div>
      </div>
    </footer>
  )
}