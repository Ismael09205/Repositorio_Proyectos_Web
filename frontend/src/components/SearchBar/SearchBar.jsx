const SearchBar = () => {
  return (
    <div className="w-full px-8 py-6 bg-white">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4">

        <input
          type="text"
          placeholder="Buscar proyectos por título, tecnología, carrera..."
          className="flex-1 border rounded-lg px-4 py-3 outline-none"
        />

        <button className="bg-indigo-700 text-white px-6 py-3 rounded-lg hover:bg-indigo-800">
          Buscar
        </button>
      </div>
    </div>
  )
}

export default SearchBar