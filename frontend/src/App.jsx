import {useState} from 'react';
import './App.css';
import iconoLogin from './assets/acceso-de-usuario.png'
import iconoGmail from './assets/gmail.png'
import iconoApple from './assets/apple.png'
import iconoLinkedin from './assets/linkedin.png'

function App() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');

  const manejarLogin = (e) => {
    e.preventDefault();
    console.log('Login:', { usuario, password });
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
            <label>Username</label>
            <input 
              type="text" 
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>

          <div className="grupo-entrada">
            <label>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="boton-login">INICIAR SESION</button>
        </form>

        <div className="seccion-login-social">
          <p className="texto-social">Iniciar sesion con:</p>
          <div className="iconos-sociales">
            <button className="boton-icono-social">
              <a href="https://gmail.com" target="_blank" rel="noreferrer" className="boton-icono-social">
              <img src={iconoGmail} alt="Gmail" />
              </a>
            </button>
            <button className="boton-icono-social">
              <a href="https://apple.com" target="_blank" rel="noreferrer" className="boton-icono-social">
              <img src={iconoApple} alt="Apple" />
              </a>
            </button>
            <button className="boton-icono-social">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="boton-icono-social">
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