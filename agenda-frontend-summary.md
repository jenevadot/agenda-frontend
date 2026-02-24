# Agenda Salon Frontend - Development Summary

## Project Overview

**Project Name:** agenda-salon-frontend
**Created:** 2026-02-06
**Updated:** 2026-02-06
**Technology Stack:** React 18 + TypeScript + Vite
**Location:** `/Users/jent/UTEC/agenda/agenda-salon-frontend`

---

## Tasks Completed

### TASK-FE-001: Project Configuration & Setup

**Status:** Completed

**What was done:**
- Initialized Vite project with `react-ts` template
- Configured Tailwind CSS v4 with custom theme matching `design-style-guide.md`
- Set up TanStack Query (React Query) with 30-second staleTime
- Installed and configured Zustand for client state management
- Set up React Router DOM with basic routes
- Configured Axios HTTP client with base URL from environment variables
- Created folder structure as per `design.md` specifications

---

### TASK-FE-002: Common UI Components

**Status:** Completed

**Components created in `src/components/comunes/`:**

| Component | File | Description |
|-----------|------|-------------|
| SpinnerCarga | `SpinnerCarga.tsx` | Animated loading spinner with sm/md/lg sizes |
| MensajeError | `MensajeError.tsx` | Error display with optional retry button |
| DialogoConfirmacion | `DialogoConfirmacion.tsx` | Accessible modal dialog with focus trap |
| Notificacion | `Notificacion.tsx` | Toast notification system (success/error/info) |
| EnvolvedorQuery | `EnvolvedorQuery.tsx` | Query wrapper handling loading/error/success states |
| Button | `Button.tsx` | Button with primary/secondary/ghost/pill variants |
| Input | `Input.tsx` | Form input with label, error, and hint support |
| Header | `Header.tsx` | Navigation header with auth state |

---

### TASK-FE-003: Authentication Store & API Client

**Status:** Completed

**Files created:**

| File | Purpose |
|------|---------|
| `src/stores/authStore.ts` | Zustand store for auth state with localStorage persistence |
| `src/api/cliente.ts` | Axios instance with JWT interceptors |
| `src/api/auth.ts` | Authentication API functions |
| `src/tipos/index.ts` | TypeScript type definitions |

---

### TASK-FE-004: Registration Form with Validation

**Status:** Completed

**Files created:**
- `src/schemas/auth.ts` - Zod validation schemas
- `src/components/auth/FormularioRegistro.tsx` - Registration form
- `src/components/auth/FormularioLogin.tsx` - Login form
- `src/pages/PaginaRegistro.tsx` - Registration page
- `src/pages/PaginaLogin.tsx` - Login page

---

### TASK-FE-005: Login Form with useAuth Hook

**Status:** Completed

**Files created:**
- `src/hooks/useAuth.ts` - Custom hook for auth operations with TanStack Query mutation

**Features:**
- Login with redirect to original URL after authentication
- Error handling for 401 and network errors
- Loading state management
- Integration with notification system

---

### TASK-FE-006: Protected Routes & Header

**Status:** Completed

**Files created:**
- `src/components/auth/RutaProtegida.tsx` - Route guard component
- `src/components/comunes/Header.tsx` - Navigation header

**Features:**
- Redirect to login for unauthenticated users
- Preserve original URL for post-login redirect
- Role-based access control (cliente, dueno_negocio)
- Responsive mobile menu
- Logout functionality

---

### TASK-FE-007: Service Catalog

**Status:** Completed

**Files created:**
- `src/api/servicios.ts` - Services API functions
- `src/hooks/useServicios.ts` - Services query hooks
- `src/components/reservas/TarjetaServicio.tsx` - Service card component
- `src/components/reservas/ListaServicios.tsx` - Services grid component

**Features:**
- Display services with name, duration, and price
- Responsive grid layout (1/2/3 columns)
- Loading and error states
- Navigate to booking flow on selection

---

### TASK-FE-008: Booking Flow Store

**Status:** Completed

**Files created:**
- `src/stores/flujoReservaStore.ts` - Booking state management

**State managed:**
- `negocioId` - Current business
- `servicioSeleccionado` - Selected service
- `fechaSeleccionada` - Selected date
- `personalSeleccionado` - Selected staff (optional)
- `horarioSeleccionado` - Selected time slot
- `periodoVista` - Calendar view period (1/2/4 weeks)

**Features:**
- Step progression logic
- Dependent selection clearing
- Flow reset functionality

---

### TASK-FE-009: Date Utilities

**Status:** Completed

**Files created:**
- `src/utils/fecha.ts` - Date formatting and manipulation
- `src/utils/idempotencia.ts` - Idempotency key generation

**Functions implemented:**
- `formatearFechaMostrar()` - "Lunes 10 de Febrero"
- `formatearFechaCorta()` - "10 Feb"
- `formatearSlotHora()` - Time formatting
- `formatearRangoHorario()` - "09:00 - 10:30"
- `obtenerRangoFechas()` - Calculate date range
- `agruparSlotsPorPeriodo()` - Group slots by morning/midday/afternoon
- `esFechaHoy()`, `esFechaPasada()` - Date checks
- `generarRangoFechas()` - Generate date array
- `formatearFechaApi()` - ISO format for API

---

### TASK-FE-010: Availability Calendar

**Status:** Completed

**Files created:**
- `src/api/disponibilidad.ts` - Availability API
- `src/hooks/useDisponibilidad.ts` - Availability query hook
- `src/components/reservas/Calendario.tsx` - Calendar component

**Features:**
- Period selector (1 week, 2 weeks, 1 month)
- Week navigation with arrows
- Visual distinction for available/unavailable dates
- Past dates disabled
- Selected date highlighting
- Today indicator
- Loading state
- Legend for date states
- Auto-refresh every 30 seconds (polling)

---

### Docker Configuration

**Status:** Completed

**Files created:**
- `Dockerfile` - Multi-stage build (Node.js builder + nginx production)
- `nginx.conf` - SPA configuration with gzip, security headers, caching
- `docker-compose.yml` - Full stack setup (frontend, backend, postgres)
- `.dockerignore` - Exclude unnecessary files from build

---

## Project Structure

```
agenda-salon-frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── api/
│   │   ├── auth.ts
│   │   ├── cliente.ts
│   │   ├── disponibilidad.ts
│   │   └── servicios.ts
│   ├── components/
│   │   ├── auth/
│   │   │   ├── FormularioLogin.tsx
│   │   │   ├── FormularioRegistro.tsx
│   │   │   ├── RutaProtegida.tsx
│   │   │   └── index.ts
│   │   ├── comunes/
│   │   │   ├── Button.tsx
│   │   │   ├── DialogoConfirmacion.tsx
│   │   │   ├── EnvolvedorQuery.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── MensajeError.tsx
│   │   │   ├── Notificacion.tsx
│   │   │   ├── SpinnerCarga.tsx
│   │   │   └── index.ts
│   │   └── reservas/
│   │       ├── Calendario.tsx
│   │       ├── ListaServicios.tsx
│   │       ├── TarjetaServicio.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── useAuth.ts
│   │   ├── useDisponibilidad.ts
│   │   └── useServicios.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/
│   │   ├── PaginaCitas.tsx
│   │   ├── PaginaInicio.tsx
│   │   ├── PaginaLogin.tsx
│   │   ├── PaginaNegocio.tsx
│   │   ├── PaginaRegistro.tsx
│   │   └── PaginaReserva.tsx
│   ├── schemas/
│   │   └── auth.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── flujoReservaStore.ts
│   ├── tipos/
│   │   └── index.ts
│   ├── utils/
│   │   ├── fecha.ts
│   │   └── idempotencia.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .dockerignore
├── .env
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── eslint.config.js
├── index.html
├── nginx.conf
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Routes

| Path | Component | Auth Required | Description |
|------|-----------|---------------|-------------|
| `/` | PaginaInicio | No | Landing page or Dashboard |
| `/login` | PaginaLogin | No | Login form |
| `/registro` | PaginaRegistro | No | Registration form |
| `/negocio/:negocioId` | PaginaNegocio | No | Business services catalog |
| `/reservar/:negocioId` | PaginaReserva | No | Booking flow |
| `/citas` | PaginaCitas | Yes | User appointments |

---

## How to Run

### Development
```bash
cd /Users/jent/UTEC/agenda/agenda-salon-frontend
npm install
npm run dev
```
Server starts at `http://localhost:5173`

### Production Build
```bash
npm run build
```
Output in `dist/` folder

### Docker (Full Stack)
```bash
# Start all services (frontend, backend, postgres)
docker-compose up -d

# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# PostgreSQL: localhost:5432
```

### Docker (Frontend Only)
```bash
docker build -t agenda-salon-frontend .
docker run -p 80:80 agenda-salon-frontend
```

---

## Build Status

**Last Build:** Successful
**Build Command:** `npm run build`
**Build Output:**
```
dist/index.html                   0.47 kB │ gzip:   0.30 kB
dist/assets/index-BFocm60e.css    7.20 kB │ gzip:   2.06 kB
dist/assets/index-B_iECHOP.js   476.69 kB │ gzip: 149.40 kB
```

---

## Next Steps (Remaining Tasks)

- **TASK-FE-011:** Staff selector component
- **TASK-FE-012:** Time slots grid component
- **TASK-FE-013:** Booking confirmation form
- **TASK-FE-014:** Create appointment with feedback
- **TASK-FE-015:** Full booking page integration
- **TASK-FE-016:** Appointments list
- **TASK-FE-017:** Appointment detail view
- **TASK-FE-018:** Appointment cancellation
- **TASK-FE-019:** Appointment editing
- **TASK-FE-020-023:** Admin panel components

---

## Notes

- Uses Tailwind CSS v4 with `@tailwindcss/postcss` plugin
- All API calls go through `/api/v1/` prefix
- Auth state persists to localStorage
- Toast notifications auto-dismiss after 5 seconds
- Calendar polls availability every 30 seconds
- Docker setup includes nginx with SPA routing support
