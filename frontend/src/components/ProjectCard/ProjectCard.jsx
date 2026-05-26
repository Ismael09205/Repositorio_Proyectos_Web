const ProjectCard = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition duration-300">

      <img
        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
        alt="project"
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <h2 className="font-semibold text-lg text-slate-800">
          Entrenamiento mediante algoritmos de machine learning
        </h2>

        <p className="text-sm text-slate-500 mt-2">
          Inteligencia Artificial
        </p>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>👍 15</span>
          <span>♡ 12</span>
          <span>💬 3</span>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard