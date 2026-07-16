// mockData.js (o donde tengas alojado este archivo)
import EPN from '../assets/universidades/EPN.png'
import ESPE from '../assets/universidades/ESPE.png'
import ESPOL from '../assets/universidades/ESPOL.png'
import PUCE from '../assets/universidades/PUCE.png'
import UCE from '../assets/universidades/UCE.svg'
import UDLA from '../assets/universidades/UDLA.png'
import UIDE from '../assets/universidades/UIDE.avif'
import USFQ from '../assets/universidades/USFQ.png'
import UTA from '../assets/universidades/UTA.png'
import UTE from '../assets/universidades/UTE.png'

export const UNIVERSIDADES = [
  {
    id: 'epn',
    name: 'Escuela Politécnica Nacional',
    image: EPN,
    color: '#000a94',
    textColor: '#ffffff',
    description: 'La EPN es una institución pública de Quito...'
  },
  {
    id: 'espe',
    name: 'Universidad de las Fuerzas Armadas ESPE',
    image: ESPE,
    color: '#047a04',
    textColor: '#FFFFFF',
    description: 'Institución de educación superior militar...'
  },
  {
    id: 'espol',
    name: 'Escuela Superior Politécnica del Litoral',
    image: ESPOL,
    color: '#23374b',
    textColor: '#FFFFFF',
    description: 'Institución pública del litoral ecuatoriano...'
  },
  {
    id: 'puce',
    name: 'Pontificia Universidad Católica del Ecuador',
    image: PUCE,
    color: '#218ae6',
    textColor: '#FFFFFF',
    description: 'Una de las universidades privadas más tradicionales...'
  },
  {
    id: 'uce',
    name: 'Universidad Central del Ecuador',
    image: UCE,
    color: '#d12346',
    textColor: '#FFFFFF',
    description: 'La universidad más antigua del país...'
  },
  {
    id: 'udla',
    name: 'Universidad de las Américas',
    image: UDLA,
    color: '#72282b',
    textColor: '#FFFFFF',
    description: 'Institución privada con moderna infraestructura...'
  },
  {
    id: 'uide',
    name: 'Universidad Internacional del Ecuador',
    image: UIDE,
    color: '#8f1242',
    textColor: '#FFFFFF',
    description: 'Ofrece una formación orientada al liderazgo global...'
  },
  {
    id: 'usfq',
    name: 'Universidad San Francisco de Quito',
    image: USFQ,
    color: '#e96519',
    textColor: '#FFFFFF',
    description: 'Líder en artes liberales...'
  },
  {
    id: 'uta',
    name: 'Universidad Técnica de Ambato',
    image: UTA,
    color: '#b41717',
    textColor: '#FFFFFF',
    description: 'Institución clave de la región Sierra-Centro...'
  },
  {
    id: 'ute',
    name: 'Universidad UTE',
    image: UTE,
    color: '#00a7bd',
    textColor: '#FFFFFF',
    description: 'Institución privada destacada en medicina...'
  }
]

export const POPULAR_TAGS = ['Inteligencia Artificial', 'TCNP', 'Medio Ambiente', 'Machine Learning', 'IoT', 'Blockchain']

// Normaliza texto: minúsculas y sin tildes, para comparar sin importar acentos
const normalizar = (str) => str
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()

// Genera el acrónimo de un nombre completo (ignora conectores como "de", "del")
const generarAcronimo = (nombre) => {
  const conectores = ['de', 'del', 'las', 'los', 'la', 'el']
  return nombre
    .split(' ')
    .filter((palabra) => palabra.length > 0 && !conectores.includes(palabra.toLowerCase()))
    .map((palabra) => palabra[0])
    .join('')
    .toLowerCase()
}

// Función central de coincidencia: soporta que el proyecto guarde "EPN", "epn",
// "Escuela Politécnica Nacional" o cualquier variación, contra el registro de universidades
export const matchesUniversity = (projectUniversidad, uni) => {
  if (!projectUniversidad || !uni) return false

  const project = normalizar(projectUniversidad)
  const fullName = normalizar(uni.name)
  const id = uni.id.toLowerCase()
  const acronimo = generarAcronimo(uni.name)

  if (project === id) return true
  if (project === fullName) return true
  if (project === acronimo) return true
  if (fullName.includes(project) && project.length >= 4) return true
  if (project.includes(fullName)) return true

  return false
}

// Nueva función de estilos basada en Universidades (ahora usa matchesUniversity)
export const getUniversityStyle = (universityNameOrId) => {
  if (!universityNameOrId) return { backgroundColor: '#e2e8f0', color: '#475569' };

  const uni = UNIVERSIDADES.find((u) => matchesUniversity(universityNameOrId, u));

  if (uni) {
    return {
      backgroundColor: uni.color,
      color: uni.textColor
    };
  }

  return {
    backgroundColor: '#64748b',
    color: '#ffffff'
  };
};

// src/services/mockData.js (o la ruta donde lo tengas)
export const CATEGORIES_CONFIG = {
  'Medicina y Salud': { code: 'MED', color: '#0284c7', bg: '#e0f2fe' },
  'Derecho y Leyes': { code: 'DER', color: '#b45309', bg: '#fef3c7' },
  'Política y Gobierno': { code: 'POL', color: '#7c3aed', bg: '#f3e8ff' },
  'Ciencias Sociales': { code: 'CSO', color: '#db2777', bg: '#fce7f3' },
  'Administración y Negocios': { code: 'ADM', color: '#059669', bg: '#d1fae5' },
  'Ingeniería y Construcción': { code: 'ING', color: '#ea580c', bg: '#ffedd5' },
  'Artes y Diseño': { code: 'ART', color: '#e11d48', bg: '#ffe4e6' },
  'Educación': { code: 'EDU', color: '#2563eb', bg: '#dbeafe' },
  'Ciencias Exactas': { code: 'CEX', color: '#0891b2', bg: '#ecfeff' },
  'Medio Ambiente y Agro': { code: 'ECO', color: '#15803d', bg: '#dcfce7' },
  'Sistemas y Software': { code: 'SIS', color: '#0f172a', bg: '#f1f5f9' },
}