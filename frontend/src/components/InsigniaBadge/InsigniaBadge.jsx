/* Mapa nombre → imagen SVG importada */
import imgExplorador  from '../../assets/insignias/explorador.svg';
import imgConstructor from '../../assets/insignias/constructor.svg';
import imgInnovador   from '../../assets/insignias/innovador.svg';
import imgPionero     from '../../assets/insignias/pionero.svg';
import imgMaestro     from '../../assets/insignias/maestro.svg';
import imgSinInsignia from '../../assets/insignias/sin-insignia.svg';
import './InsigniaBadge.css';

/* Mapa de colores por nombre (igual que en el backend) */
const MAPA_COLOR = {
  Explorador:  '#6b7280',
  Constructor: '#3b82f6',
  Innovador:   '#8b5cf6',
  Pionero:     '#f59e0b',
  Maestro:     '#ef4444',
};

/* Mapa nombre → imagen */
const MAPA_IMAGEN = {
  Explorador:  imgExplorador,
  Constructor: imgConstructor,
  Innovador:   imgInnovador,
  Pionero:     imgPionero,
  Maestro:     imgMaestro,
};

/*
  InsigniaBadge
  Props:
    insignia  — objeto con { nombre, color, emoji } o null
    totalProyectos — numero para mostrar progreso
    tipo      — 'manual' | 'auto' | null
    tamanio   — 'sm' | 'md' | 'lg'  (default: 'md')
*/
export default function InsigniaBadge({ insignia, totalProyectos = 0, tipo = null, tamanio = 'md' }) {
  /* Si no hay insignia mostramos la imagen placeholder */
  const nombre  = insignia?.nombre || null;
  const color   = insignia?.color  || MAPA_COLOR[nombre] || '#9ca3af';
  const imagen  = MAPA_IMAGEN[nombre] || imgSinInsignia;
  const etiqueta = nombre || 'Sin insignia';

  return (
    <div className={`igb igb--${tamanio}`}>
      {/* Imagen de la insignia */}
      <div
        className="igb-imagen-wrap"
        style={{ borderColor: nombre ? color : '#e5e7eb' }}
      >
        <img
          src={imagen}
          alt={`Insignia ${etiqueta}`}
          className="igb-imagen"
          draggable={false}
        />
        {/* Punto indicador si es asignada manualmente */}
        {tipo === 'manual' && (
          <span className="igb-dot-manual" title="Asignada manualmente por el administrador" />
        )}
      </div>

      {/* Texto debajo */}
      <div className="igb-info">
        <p
          className="igb-nombre"
          style={{ color: nombre ? color : '#9ca3af' }}
        >
          {etiqueta}
        </p>
        <p className="igb-proyectos">
          {totalProyectos} proyecto{totalProyectos !== 1 ? 's' : ''}
        </p>
        {tipo === 'manual' && (
          <span className="igb-etiqueta-manual">Admin asignado</span>
        )}
      </div>
    </div>
  );
}
