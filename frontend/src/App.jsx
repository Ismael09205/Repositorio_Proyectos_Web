import { useState } from 'react';
import './App.css';
import iconoLogin from './assets/acceso-de-usuario.png';
import iconoGmail from './assets/gmail.png';
import iconoApple from './assets/apple.png';
import iconoLinkedin from './assets/linkedin.png';
import { login } from './services/authService';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const { data, error } = await login(email, password);
    setCargando(false);

    if (error) {
      setError('Correo o contraseña incorrectos');
      return;
    }

    alert(`Bienvenido, ${data.user.email}`);
  };

  return (
    <div className="pagina-login">
      <div className="contenedor-login">

        <div className="seccion-logo-principal">
          <img src={iconoLogin} alt="Logo" className="icono-principal" />
        </div>

        <h1 className="titulo-login">LogIn</h1>

        <form className="formulario-login" onSubmit={manejarLogin}>
          <div className="grupo-entrada">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com"/>
          </div>

          <div className="grupo-entrada">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && (
            <p style={{ color: 'red', fontSize: '0.85rem' }}>{error}</p>
          )}

          <button type="submit" className="boton-login" disabled={cargando}>
            {cargando ? 'Cargando...' : 'INICIAR SESION'}
          </button>
        </form>

        <div className="seccion-login-social">
          <p className="texto-social">Iniciar sesion con:</p>
          <div className="iconos-sociales">
            <button className="boton-icono-social">
              <a href="https://gmail.com" target="_blank" rel="noreferrer">
                <img src={iconoGmail} alt="Gmail" />
              </a>
            </button>
            <button className="boton-icono-social">
              <a href="https://apple.com" target="_blank" rel="noreferrer">
                <img src={iconoApple} alt="Apple" />
              </a>
            </button>
            <button className="boton-icono-social">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                <img src={iconoLinkedin} alt="Linkedin" />
              </a>
            </button>
          </div>
        </div>

        <div className="seccion-registro">
          <p>No tienes cuenta? <a href="/registro">Registrarme</a></p>
        </div>

      </div>
    </div>
  );
}

export default App;