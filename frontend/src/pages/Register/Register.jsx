import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, BookOpen, AlertCircle, AtSign, Shield, GraduationCap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import '../Login/Auth.css'
import './Register.css'

const UNIVERSITIES = [
  'Escuela Politécnica Nacional (EPN)',
  'Escuela Superior Politécnica del Litoral (ESPOL)',
  'Universidad Central del Ecuador (UCE)',
  'Universidad de las Fuerzas Armadas (ESPE)',
  'Pontificia Universidad Católica del Ecuador (PUCE)',
  'Universidad Técnica de Ambato (UTA)',
  'Universidad de las Américas (UDLA)',
  'Universidad Técnica Equinoccial (UTE)',
  'Universidad Internacional del Ecuador (UIDE)',
  'Universidad San Francisco de Quito (USFQ)',
]

const CAREERS = [
  'Tecnología en Desarrollo de Software',
  'Ingeniería en Sistemas / Software',
  'Ingeniería en Telecomunicaciones',
  'Ingeniería Civil',
  'Ingeniería Electrónica',
  'Ingeniería Mecánica',
  'Ciencias de la Computación',
  'Medicina',
  'Derecho',
  'Administración de Empresas',
  'Arquitectura',
  'Otra',
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  
  // Estado para alternar entre el diseño de Admin y Estudiante
  const [isAdminForm, setIsAdminForm] = useState(false)
  
  const [form, setForm] = useState({
    name: '', username: '', email: '', password: '', confirmPassword: '',
    university: '', career: '', terms: false,
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    if (error) setError('')
  }

  const handleToggleFormType = (isAdmin) => {
    setIsAdminForm(isAdmin)
    setError('')
    setStep(1) // Reiniciamos al paso 1 por consistencia
    setForm(f => ({
      ...f,
      university: '',
      career: '',
      password: '',
      confirmPassword: ''
    }))
  }

  const validateStep1 = () => {
    if (!form.name.trim()) return 'Ingresa tu nombre completo.'
    if (!form.username.trim()) return 'Ingresa un nombre de usuario.'
    if (!form.email.includes('@') || !form.email.endsWith('@epn.edu.ec')) {
      return 'Ingresa un correo institucional válido de la EPN (@epn.edu.ec).'
    }
    return ''
  }

  const validateStep2 = () => {
    if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.'
    if (form.password !== form.confirmPassword) return 'Las contraseñas no coinciden.'
    if (!form.terms) return 'Debes aceptar los términos y condiciones.'
    return ''
  }

  const handleNextStep = () => {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validateStep2()
    if (err) { setError(err); return }
    setLoading(true)
    
   try {
    
    const datosConRol = {
      ...form,
      isAdmin: isAdminForm // Esto será true si estás en la pestaña de administrador
    }

    // Enviamos todo el objeto junto a tu función del AuthContext
    await register(datosConRol)
    
    if (isAdminForm) {
      alert('¡Registro de administrador exitoso!')
    } else {
      alert('¡Registro exitoso! Por favor, revisa tu correo institucional para verificar tu cuenta.')
    }
    navigate('/login')
  } catch (err) {
    setError(err.message || 'Error al registrarse.')
  } finally {
    setLoading(false)
  }
  }

  return (
    <div className="auth-page page-enter">
      {/* Left Panel */}
      <div className="auth-panel auth-panel--left">
        <div className="auth-panel__blob auth-panel__blob--1" />
        <div className="auth-panel__blob auth-panel__blob--2" />
        <div className="auth-panel__content">
          <Link to="/" className="auth-logo">
            <div className="auth-logo__icon">
              <BookOpen size={22} strokeWidth={2.5} />
            </div>
            <span className="auth-logo__text">poli<strong>connect</strong></span>
          </Link>
          <h2 className="auth-panel__heading">
            {isAdminForm ? 'Panel de Gestión Interna' : 'Únete a la comunidad universitaria'}
          </h2>
          <p className="auth-panel__sub">
            {isAdminForm 
              ? 'Regístrate con tu correo de gestión autorizado para moderar repositorios, auditar accesos académicos y dar soporte.'
              : 'Crea tu perfil, comparte tus proyectos de ciclo y conecta con la comunidad politécnica.'
            }
          </p>
          
          {!isAdminForm && (
            <ul className="register__benefits">
              {[
                'Publica tus proyectos de ciclo y repositorios',
                'Conecta con estudiantes e investigadores',
                'Recibe feedback de la comunidad',
                'Encuentra colaboradores para tus ideas',
              ].map(b => (
                <li key={b} className="register__benefit">
                  <span className="register__benefit-check">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">
          
          {/* BOTONES DE SELECCIÓN DE ROL */}
          <div className="auth-role-selector">
            <button 
              type="button" 
              className={`role-btn ${!isAdminForm ? 'role-btn--active' : ''}`}
              onClick={() => handleToggleFormType(false)}
            >
              <GraduationCap size={16} /> Estudiante
            </button>
            <button 
              type="button" 
              className={`role-btn ${isAdminForm ? 'role-btn--active' : ''}`}
              onClick={() => handleToggleFormType(true)}
            >
              <Shield size={16} /> Administrador
            </button>
          </div>

          {/* Indicador de pasos */}
          <div className="register__steps">
            {[1, 2].map(s => (
              <div key={s} className={`register__step${s === step ? ' register__step--active' : s < step ? ' register__step--done' : ''}`}>
                <div className="register__step-num">{s < step ? '✓' : s}</div>
                <span>{s === 1 ? 'Información básica' : 'Seguridad'}</span>
              </div>
            ))}
            <div className={`register__step-line${step > 1 ? ' register__step-line--done' : ''}`} />
          </div>

          <div className="auth-form-header">
            <h1 className="auth-form-title">
              {isAdminForm ? 'Registro Administrativo' : step === 1 ? 'Crea tu cuenta' : 'Configura tu acceso'}
            </h1>
            <p className="auth-form-sub">
              {isAdminForm ? 'Ingresa tus credenciales del sistema institucional' : step === 1 ? 'Ingresa tus datos personales e institucionales' : 'Establece tu contraseña y finaliza el registro'}
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <form className="auth-form" onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNextStep() } : handleSubmit} noValidate>
            
            {/* PASO 1: DATOS BÁSICOS */}
            {step === 1 && (
              <>
                <div className="auth-field">
                  <label className="auth-label">Nombre completo</label>
                  <div className="auth-input-wrap">
                    <User size={16} className="auth-input-icon" />
                    <input name="name" type="text" placeholder="Ej. Ismael Narváez" className="auth-input" value={form.name} onChange={handleChange} />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Nombre de usuario</label>
                  <div className="auth-input-wrap">
                    <AtSign size={16} className="auth-input-icon" />
                    <input name="username" type="text" placeholder="Ej. ismael.narvaez" className="auth-input" value={form.username} onChange={handleChange} />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Correo institucional</label>
                  <div className="auth-input-wrap">
                    <Mail size={16} className="auth-input-icon" />
                    <input 
                      name="email" 
                      type="email" 
                      placeholder={isAdminForm ? "Ej. admin.gestion@epn.edu.ec" : "ejemplo@epn.edu.ec"} 
                      className="auth-input" 
                      value={form.email} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>

                {/* Se ocultan los campos opcionales universitarios si es Admin */}
                {!isAdminForm && (
                  <>
                    <div className="auth-field">
                      <label className="auth-label">Universidad <span className="auth-label-optional">(opcional)</span></label>
                      <select name="university" className="auth-input auth-select" value={form.university} onChange={handleChange}>
                        <option value="">Selecciona tu universidad</option>
                        {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div className="auth-field">
                      <label className="auth-label">Carrera <span className="auth-label-optional">(opcional)</span></label>
                      <select name="career" className="auth-input auth-select" value={form.career} onChange={handleChange}>
                        <option value="">Selecciona tu carrera</option>
                        {CAREERS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </>
                )}

                <div className="register__actions">
                  <button type="submit" className="register__btn-submit">Continuar →</button>
                </div>
              </>
            )}

            {/* PASO 2: SEGURIDAD */}
            {step === 2 && (
              <>
                <div className="auth-field">
                  <label className="auth-label">Contraseña</label>
                  <div className="auth-input-wrap">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      name="password" type={showPass ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres" className="auth-input"
                      value={form.password} onChange={handleChange}
                    />
                    <button type="button" className="auth-input-toggle" onClick={() => setShowPass(s => !s)}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Confirmar contraseña</label>
                  <div className="auth-input-wrap">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      name="confirmPassword" type={showPass ? 'text' : 'password'}
                      placeholder="Repite tu contraseña" className="auth-input"
                      value={form.confirmPassword} onChange={handleChange}
                    />
                  </div>
                </div>

                <label className="auth-checkbox-wrap">
                  <input type="checkbox" name="terms" className="auth-checkbox" checked={form.terms} onChange={handleChange} />
                  <span className="auth-checkbox-label">
                    Acepto los Términos y condiciones y la Política de privacidad de PoliConnect.
                  </span>
                </label>

                <div className="register__actions">
                  <button type="button" className="register__btn-back" onClick={() => setStep(1)}>
                    ← Volver
                  </button>
                  <button type="submit" className={`register__btn-submit${loading ? ' loading' : ''}`} disabled={loading}>
                    {loading ? <span className="auth-spinner" /> : isAdminForm ? 'Registrar Administrador' : 'Crear cuenta'}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="auth-switch">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="auth-switch-link">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}