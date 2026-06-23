# Repositorio de Proyectos Web - PoliConnect

Sistema de gestión de proyectos universitarios con funcionalidades administrativas avanzadas.

## Tabla de Contenidos

- [Características Principales](#características-principales)
- [Sistema de Logs de Autenticación](#sistema-de-logs-de-autenticación)
- [Perfiles de Administrador](#perfiles-de-administrador)
- [Sistema de Gestión de Usuarios](#sistema-de-gestión-de-usuarios)
- [Sistema de Notificaciones](#sistema-de-notificaciones)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [API Endpoints](#api-endpoints)

## Características Principales

### 1. Autenticación Dual
- Registro e inicio de sesión para estudiantes
- Registro e inicio de sesión para administradores
- Verificación de correo institucional (@epn.edu.ec)
- Validación de correos administrativos (admin, area, gestion)

### 2. Roles de Usuario
- **Estudiante**: Acceso a funcionalidades básicas del sistema
- **Administrador**: Acceso completo con herramientas de gestión

## Sistema de Logs de Autenticación

### Descripción
Sistema completo de auditoría que registra todas las acciones de autenticación en el sistema.

### Base de Datos
Tabla `auth_logs` con los siguientes campos:
- `id`: Identificador único
- `user_id`: ID del usuario que realizó la acción
- `action`: Tipo de acción (register, register_admin, login)
- `email`: Correo electrónico del usuario
- `ip_address`: Dirección IP desde donde se realizó la acción
- `user_agent`: Información del navegador/dispositivo
- `created_at`: Fecha y hora del evento

### Funcionalidades

#### Backend
**Servicio** (`authLogs.service.js`):
- `createLog()`: Registra un nuevo evento
- `getAllLogs()`: Obtiene todos los logs con paginación
- `getLogsByAction()`: Filtra logs por tipo de acción
- `getLogsByUser()`: Filtra logs por usuario
- `getLogsByDateRange()`: Filtra logs por rango de fechas
- `getLogStatistics()`: Genera estadísticas de uso

**Controlador** (`authLogs.controller.js`):
- Maneja las peticiones HTTP
- Valida parámetros de entrada
- Retorna respuestas formateadas

**Rutas** (`authLogs.routes.js`):
- `GET /api/authLogs`: Lista todos los logs
- `GET /api/authLogs/statistics`: Estadísticas generales
- `GET /api/authLogs/action/:action`: Logs por tipo de acción
- `GET /api/authLogs/user/:userId`: Logs por usuario
- `GET /api/authLogs/date-range`: Logs por rango de fechas

Todas las rutas requieren autenticación y privilegios de administrador.

#### Frontend
**Página de Logs** (`AuthLogs.jsx`):
- Tabla interactiva con todos los registros
- Filtros por tipo de acción
- Búsqueda por email
- Paginación de resultados
- Tarjetas de estadísticas:
  - Total de registros
  - Registros de estudiantes
  - Registros de administradores
  - Inicios de sesión
- Exportación de datos
- Diseño responsive

**Acceso**:
- Botón rojo "Visualizar Logs" en el perfil del administrador
- Ruta: `/authLogs`

## Perfiles de Administrador

### Campos Específicos
Los administradores tienen campos diferentes a los estudiantes:

**Tabla `administrators`**:
- `id`: ID del usuario (FK a auth.users)
- `name`: Nombre completo
- `username`: Nombre de usuario
- `cargo`: Puesto o cargo administrativo
- `especialidad`: Área de especialización
- `sector`: Sector o departamento
- `biografia`: Biografía profesional
- `ciudad`: Ciudad de residencia
- `github_url`: Perfil de GitHub
- `linkedin_url`: Perfil de LinkedIn

### Formulario de Perfil
El formulario de perfil se adapta según el rol:
- **Estudiantes**: Facultad, Carrera, Semestre
- **Administradores**: Cargo, Especialidad, Sector

### Registro de Administradores
Validaciones especiales:
- Correo debe terminar en @epn.edu.ec
- Correo debe contener palabras clave: admin, area, o gestion
- Ejemplo válido: admin.sistemas@epn.edu.ec

## Sistema de Gestión de Usuarios

### Descripción
Panel completo de administración para gestionar todos los usuarios del sistema.

### Funcionalidades CRUD

#### Backend
**Servicio** (`adminUsers.service.js`):
- `getAllUsers()`: Lista todos los usuarios (estudiantes y admins)
- `getUserById()`: Obtiene detalles de un usuario específico
- `updateUser()`: Actualiza información de usuario
- `deleteUser()`: Eliminación permanente (soft delete mediante ban)
- `deactivateUser()`: Desactivación temporal (30 días por defecto)
- `activateUser()`: Reactivación de cuenta
- `searchUsers()`: Búsqueda por nombre o email

**Controlador** (`adminUsers.controller.js`):
- Validación de permisos administrativos
- Prevención de auto-eliminación/desactivación
- Manejo de errores específicos

**Rutas** (`adminUsers.routes.js`):
- `GET /api/admin/users`: Listar usuarios
- `GET /api/admin/users/search?query=`: Buscar usuarios
- `GET /api/admin/users/:userId`: Obtener usuario
- `PUT /api/admin/users/:userId`: Actualizar usuario
- `DELETE /api/admin/users/:userId`: Eliminar usuario
- `POST /api/admin/users/:userId/deactivate`: Desactivar usuario
- `POST /api/admin/users/:userId/activate`: Activar usuario

#### Frontend
**Página de Gestión** (`UserManagement.jsx`):

**Dashboard de Estadísticas**:
- Total de usuarios
- Usuarios activos
- Usuarios inactivos
- Total de administradores

**Tabla de Usuarios**:
- Avatar con iniciales
- Nombre completo
- Email
- Badge de rol (Administrador/Estudiante)
- Badge de estado (Activo/Inactivo)
- Último acceso
- Botones de acción

**Acciones Disponibles**:
- Desactivar cuenta (temporal, 30 días)
- Activar cuenta
- Eliminar usuario (permanente)
- Búsqueda en tiempo real

**Características de Seguridad**:
- Confirmación modal para acciones destructivas
- Prevención de auto-eliminación
- Validación de permisos en cada acción

**Acceso**:
- Botón azul "Gestionar Usuarios" en el perfil del administrador
- Ruta: `/user-management`

### Desactivación de Cuentas
**Temporal**:
- Duración: 30 días (configurable)
- Usuario no puede iniciar sesión
- Datos preservados
- Reversible mediante activación

**Permanente**:
- Soft delete mediante ban indefinido
- Usuario no puede iniciar sesión
- Datos preservados en base de datos
- No reversible desde la interfaz

## Sistema de Notificaciones

### Librería
React Hot Toast - Sistema moderno de notificaciones toast.

### Configuración
**Ubicación**: `App.jsx`

**Características**:
- Posición: Esquina superior derecha
- Duración: 3-6 segundos según tipo
- Estilos personalizados con sombras
- Iconos de éxito y error
- Animaciones suaves

### Tipos de Notificaciones

**Registro Exitoso**:
- Estudiantes: Mensaje con recordatorio de verificación de email
- Administradores: Confirmación de registro administrativo

**Inicio de Sesión**:
- Bienvenida personalizada
- Detección de cuenta desactivada
- Errores de credenciales

**Gestión de Usuarios**:
- Confirmación de desactivación
- Confirmación de activación
- Confirmación de eliminación
- Errores específicos

## Estructura del Proyecto

```
Repositorio_Proyectos_Web/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── authLogs.controller.js
│   │   │   └── adminUsers.controller.js
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── authLogs.routes.js
│   │   │   └── adminUsers.routes.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── user.service.js
│   │   │   ├── authLogs.service.js
│   │   │   └── adminUsers.service.js
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   ├── Profile/
│   │   │   ├── AuthLogs/
│   │   │   │   ├── AuthLogs.jsx
│   │   │   │   └── AuthLogs.css
│   │   │   └── UserManagement/
│   │   │       ├── UserManagement.jsx
│   │   │       └── UserManagement.css
│   │   ├── services/
│   │   │   └── authService.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Instalación

### Requisitos Previos
- Node.js (v14 o superior)
- npm o yarn
- Cuenta de Supabase

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Configuración

### Variables de Entorno (Backend)
Crear archivo `.env` en la carpeta `backend`:
```env
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_KEY=tu_supabase_service_key
PORT=3000
```

### Base de Datos Supabase

#### Tabla auth_logs
```sql
CREATE TABLE auth_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_auth_logs_user_id ON auth_logs(user_id);
CREATE INDEX idx_auth_logs_action ON auth_logs(action);
CREATE INDEX idx_auth_logs_created_at ON auth_logs(created_at);
```

#### Tabla administrators
```sql
CREATE TABLE administrators (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  cargo VARCHAR(255),
  especialidad VARCHAR(255),
  sector VARCHAR(255),
  biografia TEXT,
  ciudad VARCHAR(100),
  github_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de estudiante
- `POST /api/auth/register-admin` - Registro de administrador
- `POST /api/auth/login` - Inicio de sesión

### Usuarios
- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil

### Logs (Solo Administradores)
- `GET /api/authLogs` - Listar todos los logs
- `GET /api/authLogs/statistics` - Estadísticas
- `GET /api/authLogs/action/:action` - Logs por acción
- `GET /api/authLogs/user/:userId` - Logs por usuario
- `GET /api/authLogs/date-range` - Logs por fecha

### Gestión de Usuarios (Solo Administradores)
- `GET /api/admin/users` - Listar usuarios
- `GET /api/admin/users/search` - Buscar usuarios
- `GET /api/admin/users/:userId` - Obtener usuario
- `PUT /api/admin/users/:userId` - Actualizar usuario
- `DELETE /api/admin/users/:userId` - Eliminar usuario
- `POST /api/admin/users/:userId/deactivate` - Desactivar usuario
- `POST /api/admin/users/:userId/activate` - Activar usuario

## Ejecución

### Desarrollo

**Backend**:
```bash
cd backend
npm start
```

**Frontend**:
```bash
cd frontend
npm run dev
```

### Producción

**Backend**:
```bash
cd backend
npm run build
npm run start:prod
```

**Frontend**:
```bash
cd frontend
npm run build
```

## Seguridad

### Autenticación
- Tokens JWT mediante Supabase Auth
- Middleware de autenticación en todas las rutas protegidas
- Validación de roles (estudiante/administrador)

### Autorización
- Middleware `isAdmin` para rutas administrativas
- Verificación de permisos en cada endpoint
- Prevención de escalada de privilegios

### Validaciones
- Validación de correos institucionales
- Validación de correos administrativos
- Longitud mínima de contraseñas (6 caracteres)
- Sanitización de inputs

### Protecciones
- Prevención de auto-eliminación de administradores
- Confirmación de acciones destructivas
- Rate limiting (recomendado implementar)
- CORS configurado

## Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- Supabase (Base de datos y autenticación)
- CommonJS modules

### Frontend
- React
- React Router
- React Hot Toast
- Lucide React (iconos)
- Vite

## Licencia

Este proyecto es privado y de uso exclusivo para la Escuela Politécnica Nacional.

## Contacto

Para soporte o consultas, contactar al equipo de desarrollo.
