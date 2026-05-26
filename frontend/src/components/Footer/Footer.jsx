import { Link } from 'react-router-dom'
import './Footer.css'

const LINKS = {
  Plataforma: [
    { label: 'Inicio', to: '/' },
    { label: 'Explorar proyectos', to: '/explorar' },
    { label: 'Categorías', to: '/categorias' },
    { label: 'Blog', to: '/blog' },
  ],
  Comunidad: [
    { label: 'Sobre nosotros', to: '/nosotros' },
    { label: 'Únete como autor', to: '/register' },
    { label: 'Universidades', to: '/universidades' },
    { label: 'Mentores', to: '/mentores' },
  ],
  Soporte: [
    { label: 'FAQ', to: '/faq' },
    { label: 'Contáctanos', to: '/contacto' },
    { label: 'Términos y condiciones', to: '/terminos' },
    { label: 'Política de privacidad', to: '/privacidad' },
  ],
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__main container">
        {/* Brand */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <div className="footer__logo-icon" />
            <span className="footer__logo-text">poli<strong>connect</strong></span>
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
            <Link to="/faq">FAQ</Link>
            <span>·</span>
            <Link to="/terminos">Términos y Condiciones</Link>
            <span>·</span>
            <Link to="/privacidad">Privacy Policy</Link>
          </div>

          <div className="footer__socials">
            {['GitHub', 'Twitter', 'LinkedIn', 'Email'].map((label, i) => (
              <a key={i} href="#" className="footer__social-btn" aria-label={label}>
                {label}
              </a>
            ))}
          </div>

          <p className="footer__copy">© Copyright 2026 PoliConnect</p>
        </div>
      </div>
    </footer>
  )
}