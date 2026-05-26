import logo from '../../assets/logo.png'

const Navbar = () => {
  return (
    <nav className="w-full border-b bg-white px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">

        <div className="flex items-center gap-2">
          <img src={logo} alt="PoliConnect Logo" className="w-24 h-21" />
        </div>

        <ul className="hidden md:flex items-center gap-8 text-sm text-slate-700">
          <li className="cursor-pointer hover:text-blue-600">Inicio</li>
          <li className="cursor-pointer hover:text-blue-600">Explorar</li>
          <li className="cursor-pointer hover:text-blue-600">Categorías</li>
          <li className="cursor-pointer hover:text-blue-600">Blog</li>
          <li className="cursor-pointer hover:text-blue-600">Sobre nosotros</li>
        </ul>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar proyectos..."
          className="border rounded-md px-3 py-2 text-sm outline-none"
        />

        <button className="border border-cyan-500 text-cyan-600 px-4 py-2 rounded-md text-sm hover:bg-cyan-50">
          Iniciar Sesión
        </button>

        <button className="bg-cyan-500 text-white px-4 py-2 rounded-md text-sm hover:bg-cyan-600">
          Registrarse
        </button>
      </div>
    </nav>
  )
}

export default Navbar