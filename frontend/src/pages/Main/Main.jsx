import Navbar from "../../components/Navbar/Navbar"
import Hero from "../../components/Hero/Hero"
import SearchBar from "../../components/SearchBar/SearchBar"
import ProjectCard from "../../components/ProjectCard/ProjectCard"
import Footer from "../../components/Footer/Footer"

const Main = () => {

  return (
    <div className="bg-slate-100 min-h-screen">

      <Navbar />

      <Hero />

      <SearchBar />

      <section className="px-8 py-10">

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            Proyectos destacados
          </h2>

          <button className="text-cyan-600 hover:underline">
            Ver todos
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProjectCard />
          <ProjectCard />
          <ProjectCard />
          <ProjectCard />
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Main