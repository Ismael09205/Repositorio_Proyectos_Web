const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white px-8 py-10 mt-16">

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">

        <div>
          <h2 className="text-2xl font-bold">
            PoliConnect
          </h2>

          <p className="text-slate-400 mt-3 max-w-sm">
            Plataforma para compartir proyectos universitarios y conectar estudiantes.
          </p>
        </div>

        <div className="flex gap-10">
          <div>
            <h3 className="font-semibold mb-3">Links</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>About</li>
              <li>Contacto</li>
              <li>Servicios</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>Términos</li>
              <li>Privacidad</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer