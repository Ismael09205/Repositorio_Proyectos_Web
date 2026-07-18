import { Link } from 'react-router-dom';
import './SobreNosotros.css';

const valoresPlataforma = [
  {
    id: 'colaboracion',
    titulo: 'Colaboración real',
    descripcion:
      'Cada proyecto se comparte para que otros estudiantes lo lean, lo comenten y aprendan de él, no para que quede guardado en una carpeta.',
  },
  {
    id: 'acceso',
    titulo: 'Acceso abierto',
    descripcion:
      'Estudiantes de cualquier universidad del Ecuador pueden explorar proyectos de otras carreras y otras ciudades sin barreras.',
  },
  {
    id: 'calidad',
    titulo: 'Retroalimentación con criterio',
    descripcion:
      'Los comentarios y calificaciones vienen de otros estudiantes y docentes, así que reflejan trabajo académico evaluado por pares.',
  },
];

const cifrasPlataforma = [
  { id: 'universidades', numero: '11+', etiqueta: 'universidades representadas' },
  { id: 'proyectos', numero: '500+', etiqueta: 'proyectos compartidos' },
  { id: 'carreras', numero: '20+', etiqueta: 'carreras distintas' },
];

function SobreNosotros() {
  return (
    <main className="sobre-nosotros-page page-enter">
      <section className="sobre-nosotros-hero">
        <div className="container sobre-nosotros-hero__inner">
          <span className="badge sobre-nosotros-hero__eyebrow">Sobre nosotros</span>
          <h1 className="sobre-nosotros-hero__title">
            Un espacio donde el trabajo académico ecuatoriano no se queda en el cajón
          </h1>
          <p className="sobre-nosotros-hero__subtitle">
            IdeAgora nació en las aulas: un grupo de estudiantes de desarrollo web se
            cansó de ver proyectos excelentes desaparecer después de la calificación
            final. Construimos el lugar donde esos proyectos siguen vivos.
          </p>
        </div>
      </section>

      <section className="sobre-nosotros-stats">
        <div className="container sobre-nosotros-stats__grid">
          {cifrasPlataforma.map((cifra) => (
            <div className="sobre-nosotros-stats__item" key={cifra.id}>
              <span className="sobre-nosotros-stats__numero">{cifra.numero}</span>
              <span className="sobre-nosotros-stats__etiqueta">{cifra.etiqueta}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="sobre-nosotros-mision">
        <div className="container sobre-nosotros-mision__grid">
          <div className="sobre-nosotros-mision__text">
            <h2 className="section-title">Nuestra misión</h2>
            <p>
              Creemos que un proyecto de aula tiene valor más allá de la nota. Por eso
              construimos una plataforma pensada para estudiantes ecuatorianos, donde
              subir un trabajo es tan fácil como compartirlo, y donde encontrar
              inspiración para el próximo semestre toma minutos, no semanas de
              búsqueda.
            </p>
            <p>
              IdeAgora conecta carreras, universidades y ciudades distintas alrededor
              de una misma idea: el conocimiento académico se multiplica cuando se
              comparte.
            </p>
          </div>
          <div className="sobre-nosotros-mision__card">
            <h3>Hecho por estudiantes, para estudiantes</h3>
            <p>
              El equipo detrás de IdeAgora está formado por estudiantes de desarrollo
              web que diseñaron, programaron y probaron cada parte de la plataforma
              como un proyecto propio.
            </p>
          </div>
        </div>
      </section>

      <section className="sobre-nosotros-valores">
        <div className="container">
          <h2 className="section-title sobre-nosotros-valores__title">Lo que nos guía</h2>
          <div className="sobre-nosotros-valores__grid">
            {valoresPlataforma.map((valor, index) => (
              <article className="sobre-nosotros-valores__card" key={valor.id}>
                <span className="sobre-nosotros-valores__index">{String(index + 1).padStart(2, '0')}</span>
                <h3>{valor.titulo}</h3>
                <p>{valor.descripcion}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sobre-nosotros-cta">
        <div className="container sobre-nosotros-cta__inner">
          <h2>¿Tienes un proyecto que merece ser visto?</h2>
          <p>Súbelo hoy y forma parte de la comunidad académica de IdeAgora.</p>
        </div>
      </section>
    </main>
  );
}

export default SobreNosotros;