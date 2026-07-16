import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import './MainLayout.css'

export default function MainLayout() {

  const location = useLocation()

  // Mapeamos las rutas reales que tienes configuradas en App.jsx
  const ocultarFooterEn = ['/chat', '/mis-proyectos', '/perfil', '/proyecto', '/done', '/login', '/register', '/forgot-password', '/reset-password', '/admin', '/explorar','/universidades', '/universidad', '/subir-proyecto' ]

  // Verificamos si la ruta actual empieza con alguna de la lista
  const deberiaOcultarFooter = ocultarFooterEn.some(ruta => 
    location.pathname.startsWith(ruta)
  )

  return (
    <div className="layout">
      <Navbar />
      <main className="layout__main">
        <Outlet />
      </main>
      {!deberiaOcultarFooter && <Footer />}
    </div>
  )
}