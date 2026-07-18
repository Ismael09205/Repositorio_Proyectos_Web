import './Privacidad.css';

const clausulasPrivacidad = [
  {
    id: 'datos-recopilados',
    titulo: '1. Datos que recopilamos',
    contenido: [
      'Al registrarte recopilamos nombre, correo institucional o personal, universidad y carrera. Al subir un proyecto, guardamos también los archivos y la información descriptiva que proporcionas.',
      'Registramos eventos de inicio de sesión (fecha, hora) con fines de seguridad, visibles en el historial de autenticación de tu cuenta.',
    ],
  },
  {
    id: 'uso-datos',
    titulo: '2. Cómo usamos tus datos',
    contenido: [
      'Usamos tus datos para mostrar tu perfil y proyectos dentro de la plataforma, permitir la búsqueda por universidad o carrera, y enviarte notificaciones relacionadas con tu actividad.',
      'No vendemos ni compartimos tus datos personales con terceros con fines publicitarios.',
    ],
  },
  {
    id: 'almacenamiento',
    titulo: '3. Almacenamiento y seguridad',
    contenido: [
      'Los datos se almacenan en infraestructura de Supabase con acceso protegido mediante autenticación y políticas de seguridad a nivel de fila (RLS).',
      'Las contraseñas nunca se guardan en texto plano; se gestionan mediante el sistema de autenticación de Supabase.',
    ],
  },
  {
    id: 'derechos-usuario',
    titulo: '4. Tus derechos',
    contenido: [
      'Puedes acceder, actualizar o eliminar tu información personal desde tu perfil en cualquier momento.',
      'Puedes solicitar la eliminación completa de tu cuenta y los proyectos asociados escribiendo a través de la página de contactos.',
    ],
  },
  {
    id: 'cookies',
    titulo: '5. Cookies y sesión',
    contenido: [
      'Usamos almacenamiento local del navegador para mantener tu sesión iniciada. No utilizamos cookies de rastreo publicitario.',
    ],
  },
  {
    id: 'menores',
    titulo: '6. Menores de edad',
    contenido: [
      'IdeAgora está dirigida a estudiantes de educación superior. No está diseñada para ser usada por menores de 18 años sin supervisión de una institución educativa.',
    ],
  },
  {
    id: 'cambios-privacidad',
    titulo: '7. Cambios en esta política',
    contenido: [
      'Si actualizamos esta política de forma sustancial, lo comunicaremos dentro de la plataforma antes de que entre en vigencia.',
    ],
  },
];

function Privacidad() {
  return (
    <main className="legal-page page-enter">
      <section className="legal-hero">
        <div className="container">
          <span className="badge legal-hero__eyebrow">Documento legal</span>
          <h1 className="legal-hero__title">Política de privacidad</h1>
          <p className="legal-hero__updated">Última actualización: julio de 2026</p>
        </div>
      </section>

      <section className="legal-body">
        <div className="container legal-body__grid">
          <nav className="legal-index" aria-label="Índice de privacidad">
            <span className="legal-index__label">En esta página</span>
            <ul>
              {clausulasPrivacidad.map((clausula) => (
                <li key={clausula.id}>
                  <a href={`#${clausula.id}`}>{clausula.titulo}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="legal-content">
            {clausulasPrivacidad.map((clausula) => (
              <article className="legal-content__section" id={clausula.id} key={clausula.id}>
                <h2>{clausula.titulo}</h2>
                {clausula.contenido.map((parrafo, index) => (
                  <p key={index}>{parrafo}</p>
                ))}
              </article>
            ))}

            <p className="legal-content__contacto">
              ¿Tienes dudas sobre el manejo de tus datos? Escríbenos desde la página de{' '}
              <a href="/contact">contactos</a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Privacidad;