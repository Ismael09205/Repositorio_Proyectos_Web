import './Politicas.css';

const clausulasPolitica = [
  {
    id: 'uso-plataforma',
    titulo: '1. Uso de la plataforma',
    contenido: [
      'IdeAgora está destinada a estudiantes, docentes e instituciones de educación superior del Ecuador que deseen compartir y consultar proyectos académicos.',
      'El registro requiere información veraz. Cuentas creadas con datos falsos o suplantando a otra persona pueden ser suspendidas sin previo aviso.',
    ],
  },
  {
    id: 'contenido-publicado',
    titulo: '2. Contenido publicado',
    contenido: [
      'Al subir un proyecto, el usuario declara que es autor del trabajo o cuenta con autorización de sus coautores para compartirlo públicamente.',
      'No se permite publicar contenido plagiado, con derechos de autor de terceros sin permiso, ni material que infrinja normativas académicas de la institución de origen.',
      'IdeAgora puede retirar cualquier proyecto que incumpla estas condiciones, previa notificación al usuario cuando sea posible.',
    ],
  },
  {
    id: 'interaccion-comunidad',
    titulo: '3. Interacción con la comunidad',
    contenido: [
      'Los comentarios, calificaciones y mensajes del chat deben mantener un tono respetuoso. No se toleran ataques personales, discriminación ni acoso.',
      'Las cuentas que incurran en conductas abusivas de forma reiterada pueden ser restringidas o eliminadas.',
    ],
  },
  {
    id: 'propiedad-intelectual',
    titulo: '4. Propiedad intelectual',
    contenido: [
      'El autor conserva los derechos sobre su proyecto. Publicarlo en IdeAgora no transfiere la propiedad intelectual a la plataforma.',
      'IdeAgora obtiene una licencia limitada para mostrar, indexar y permitir la consulta del proyecto dentro de la plataforma, mientras la cuenta permanezca activa.',
    ],
  },
  {
    id: 'cuentas-suspension',
    titulo: '5. Suspensión de cuentas',
    contenido: [
      'IdeAgora se reserva el derecho de suspender cuentas que violen estas políticas, incluyendo publicación de contenido inapropiado, plagio comprobado o uso indebido del sistema de pagos.',
    ],
  },
  {
    id: 'cambios-politica',
    titulo: '6. Cambios en esta política',
    contenido: [
      'Estas políticas pueden actualizarse para reflejar cambios en la plataforma o en la normativa aplicable. Los cambios relevantes se comunicarán dentro de la plataforma.',
    ],
  },
];

function Politicas() {
  return (
    <main className="legal-page page-enter">
      <section className="legal-hero">
        <div className="container">
          <span className="badge legal-hero__eyebrow">Documento legal</span>
          <h1 className="legal-hero__title">Políticas de uso</h1>
          <p className="legal-hero__updated">Última actualización: julio de 2026</p>
        </div>
      </section>

      <section className="legal-body">
        <div className="container legal-body__grid">
          <nav className="legal-index" aria-label="Índice de políticas">
            <span className="legal-index__label">En esta página</span>
            <ul>
              {clausulasPolitica.map((clausula) => (
                <li key={clausula.id}>
                  <a href={`#${clausula.id}`}>{clausula.titulo}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="legal-content">
            {clausulasPolitica.map((clausula) => (
              <article className="legal-content__section" id={clausula.id} key={clausula.id}>
                <h2>{clausula.titulo}</h2>
                {clausula.contenido.map((parrafo, index) => (
                  <p key={index}>{parrafo}</p>
                ))}
              </article>
            ))}

            <p className="legal-content__contacto">
              ¿Tienes dudas sobre estas políticas? Escríbenos desde la página de{' '}
              <a href="/contact">contactos</a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Politicas;