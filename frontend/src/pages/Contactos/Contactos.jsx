import { useState } from 'react';
import toast from 'react-hot-toast';
import './Contactos.css';

const canalesContacto = [
  {
    id: 'correo',
    etiqueta: 'Correo',
    valor: 'soporte@ideagora.ec',
    href: 'mailto:soporte@ideagora.ec',
  },
  {
    id: 'ubicacion',
    etiqueta: 'Ubicación',
    valor: 'Quito, Ecuador',
    href: null,
  },
  {
    id: 'horario',
    etiqueta: 'Horario de respuesta',
    valor: 'Lunes a viernes, 9:00 - 18:00',
    href: null,
  },
];

const estadoInicial = {
  nombre: '',
  correo: '',
  asunto: '',
  mensaje: '',
};

function Contactos() {
  const [formulario, setFormulario] = useState(estadoInicial);
  const [enviando, setEnviando] = useState(false);

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setFormulario((previo) => ({ ...previo, [name]: value }));
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();

    if (!formulario.nombre || !formulario.correo || !formulario.mensaje) {
      toast.error('Completa nombre, correo y mensaje antes de enviar.');
      return;
    }

    setEnviando(true);
    try {
      // TODO: conectar con el endpoint real de contacto del backend
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Mensaje enviado. Te responderemos pronto.');
      setFormulario(estadoInicial);
    } catch (error) {
      toast.error('No se pudo enviar el mensaje. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="contactos-page page-enter">
      <section className="contactos-hero">
        <div className="container">
          <span className="badge contactos-hero__eyebrow">Contactos</span>
          <h1 className="contactos-hero__title">Hablemos</h1>
          <p className="contactos-hero__subtitle">
            ¿Preguntas sobre tu cuenta, un proyecto o una alianza con tu universidad?
            Escríbenos y te respondemos en menos de dos días hábiles.
          </p>
        </div>
      </section>

      <section className="contactos-body">
        <div className="container contactos-body__grid">
          <form className="contactos-form" onSubmit={manejarEnvio}>
            <div className="contactos-form__row">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                placeholder="Tu nombre completo"
                value={formulario.nombre}
                onChange={manejarCambio}
              />
            </div>

            <div className="contactos-form__row">
              <label htmlFor="correo">Correo</label>
              <input
                id="correo"
                name="correo"
                type="email"
                placeholder="tu@correo.com"
                value={formulario.correo}
                onChange={manejarCambio}
              />
            </div>

            <div className="contactos-form__row">
              <label htmlFor="asunto">Asunto</label>
              <input
                id="asunto"
                name="asunto"
                type="text"
                placeholder="¿Sobre qué quieres escribirnos?"
                value={formulario.asunto}
                onChange={manejarCambio}
              />
            </div>

            <div className="contactos-form__row">
              <label htmlFor="mensaje">Mensaje</label>
              <textarea
                id="mensaje"
                name="mensaje"
                rows={5}
                placeholder="Cuéntanos en qué podemos ayudarte"
                value={formulario.mensaje}
                onChange={manejarCambio}
              />
            </div>

            <button type="submit" className="btn btn-accent contactos-form__submit" disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>

          <aside className="contactos-info">
            <h2>Otras formas de contactarnos</h2>
            <ul className="contactos-info__list">
              {canalesContacto.map((canal) => (
                <li key={canal.id}>
                  <span className="contactos-info__etiqueta">{canal.etiqueta}</span>
                  {canal.href ? (
                    <a href={canal.href}>{canal.valor}</a>
                  ) : (
                    <span className="contactos-info__valor">{canal.valor}</span>
                  )}
                </li>
              ))}
            </ul>

            <div className="contactos-info__card">
              <h3>¿Eres representante de una universidad?</h3>
              <p>
                Si quieres integrar a tu institución a IdeAgora como espacio oficial
                para proyectos de tus estudiantes, cuéntanos en el asunto del
                formulario.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default Contactos;