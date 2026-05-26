const Hero = () => {
  return (
    <section className="w-full bg-slate-50 px-8 py-16 flex flex-col lg:flex-row items-center justify-between gap-10">

      <div className="max-w-xl">
        <h1 className="text-5xl font-bold text-indigo-900 leading-tight">
          Explora proyectos universitarios que inspiran el futuro
        </h1>

        <p className="mt-6 text-slate-600 text-lg">
          Descubre, comparte y aprende de proyectos desarrollados por estudiantes.
        </p>

        <div className="mt-8 flex gap-4">
          <button className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600">
            Explorar proyectos
          </button>

          <button className="border border-slate-300 px-6 py-3 rounded-lg hover:bg-slate-100">
            Publicar proyecto
          </button>
        </div>
      </div>

      <div className="w-full max-w-lg">
        <img
          src="https://illustrations.popsy.co/amber/digital-nomad.svg"
          alt="hero"
          className="w-full"
        />
      </div>
    </section>
  )
}

export default Hero