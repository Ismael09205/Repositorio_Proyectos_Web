import { useState } from "react"
import { registerUser } from "../../services/authService"

const Register = () => {

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })

  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      const data = await registerUser(formData)

      console.log(data)

      alert("Usuario registrado 😎")

    } catch (error) {

      console.error(error)

      alert("Error al registrar")

    }

  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >

        <h1 className="text-3xl font-bold mb-6 text-center">
          Crear cuenta
        </h1>

        <div className="mb-4">

          <label className="block mb-2 text-sm">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 outline-none"
            required
          />

        </div>

        <div className="mb-6">

          <label className="block mb-2 text-sm">
            Contraseña
          </label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 outline-none"
            required
          />

        </div>

        <button
          type="submit"
          className="w-full bg-cyan-500 text-white py-3 rounded-lg hover:bg-cyan-600"
        >
          Registrarse
        </button>

      </form>

    </div>

  )
}

export default Register