import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home/Home.jsx'
import Explore from './pages/Explore/Explore.jsx'
import Login from './pages/Login/Login.jsx'
import Register from './pages/Register/Register.jsx'
import ForgotPassword from './pages/Login/ForgotPassword.jsx'
import ResetPassword from './pages/Login/ResetPassword.jsx'
import Profile from './pages/Profile/Profile.jsx'
import AuthLogs from './pages/AuthLogs/AuthLogs.jsx'
import UserManagement from './pages/UserManagement/UserManagement.jsx'
import MyProjects from './pages/MyProjects/MyProjects.jsx'
import ProjectDetail from './pages/ProjectDetail/ProjectDetail.jsx'
import MainLayout from './layouts/MainLayout.jsx'

function App() {
  return (

    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'react-hot-toast',
          style: {
            background: '#fff',
            color: '#333',
            padding: '16px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            '--toast-duration': '4000ms',
          },
          success: {
            className: 'react-hot-toast success',
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              '--toast-duration': '4000ms',
            },
          },
          error: {
            className: 'react-hot-toast error',
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              '--toast-duration': '4000ms',
            },
          },
        }}
      />

    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explorar" element={<Explore />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/authLogs" element={<AuthLogs />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/mis-proyectos" element={<MyProjects />} />
        <Route path="/proyecto/:id" element={<ProjectDetail />} />
        <Route path="/categorias" element={<Navigate to="/explorar" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default App