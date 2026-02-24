# 🏗️ Arquitectura Frontend - Agenda Salón

## 📋 Tabla de Contenidos
- [Visión General](#visión-general)
- [Diagrama de Arquitectura](#diagrama-de-arquitectura)
- [Flujo de Navegación](#flujo-de-navegación)
- [Flujo de Autenticación](#flujo-de-autenticación)
- [Flujo de Reserva](#flujo-de-reserva)
- [Gestión de Estado](#gestión-de-estado)
- [API & Servicios](#api--servicios)

---

## Visión General

Sistema de agendamiento de citas para salones de belleza construido con:

**Stack Tecnológico:**
- ⚛️ React 19 + TypeScript
- 🎨 Tailwind CSS v4
- 🔄 React Query (TanStack Query)
- 📝 React Hook Form + Zod
- 🗂️ Zustand (Estado Global)
- 🛣️ React Router v7
- 📡 Axios

---

## Diagrama de Arquitectura

```mermaid
graph TB
    subgraph "🌐 CLIENTE (Browser)"
        A[👤 Usuario]
    end

    subgraph "⚛️ REACT APP"
        B[main.tsx<br/>Entry Point]
        C[App.tsx<br/>Router Setup]

        subgraph "📄 PAGES"
            D1[🏠 PaginaInicio]
            D2[🔐 Login/Registro]
            D3[📅 PaginaReserva]
            D4[📋 PaginaCitas]
            D5[⚙️ PanelAdmin]
        end

        subgraph "🧩 COMPONENTS"
            E1[🔒 auth/<br/>Login, Registro, RutaProtegida]
            E2[🎫 reservas/<br/>5 pasos de reserva]
            E3[📌 citas/<br/>Gestión de citas]
            E4[👔 admin/<br/>Panel administración]
            E5[🔧 comunes/<br/>Button, Input, etc]
        end

        subgraph "🪝 HOOKS"
            F1[useAuth]
            F2[useServicios]
            F3[useDisponibilidad]
            F4[useCitas]
            F5[useNegocio]
        end

        subgraph "🗄️ STATE (Zustand)"
            G1[authStore<br/>Usuario, Token]
            G2[flujoReservaStore<br/>Estado reserva]
        end

        subgraph "📡 API LAYER"
            H1[cliente.ts<br/>Axios Config]
            H2[auth.ts]
            H3[servicios.ts]
            H4[disponibilidad.ts]
            H5[citas.ts]
            H6[negocios.ts]
        end

        subgraph "✅ VALIDATIONS"
            I1[schemas/auth.ts<br/>Zod]
            I2[schemas/reserva.ts<br/>Zod]
        end
    end

    subgraph "🌍 BACKEND API"
        J[REST API<br/>Django/FastAPI]
    end

    A -->|Interacción| B
    B --> C
    C -->|Rutas| D1 & D2 & D3 & D4 & D5

    D1 & D2 & D3 & D4 & D5 -->|Usa| E1 & E2 & E3 & E4 & E5
    E1 & E2 & E3 & E4 & E5 -->|Consumen| F1 & F2 & F3 & F4 & F5

    F1 & F2 & F3 & F4 & F5 -->|Lee/Escribe| G1 & G2
    F1 & F2 & F3 & F4 & F5 -->|HTTP Calls| H1

    H1 --> H2 & H3 & H4 & H5 & H6
    H2 & H3 & H4 & H5 & H6 -->|Requests| J

    E1 & E2 -->|Valida con| I1 & I2

    style A fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    style G1 fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style G2 fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style J fill:#f3e5f5,stroke:#4a148c,stroke-width:3px
    style H1 fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
```

---

## Flujo de Navegación

```mermaid
graph LR
    A[🏠 Inicio] -->|Ver negocio| B[🏢 PaginaNegocio]
    B -->|Reservar| C[📅 PaginaReserva]

    A -->|Login| D[🔐 Login]
    D -->|Éxito| E[Autenticado]

    E -->|Mis citas| F[📋 PaginaCitas]
    F -->|Ver detalle| G[🔍 DetalleCita]
    G -->|Editar| H[✏️ EditarCita]

    E -->|Admin| I[⚙️ PanelAdmin]
    I -->|Subpanel| J[Dashboard, Calendario,<br/>Horarios, Servicios,<br/>Personal, Excepciones]

    C -->|Completar| K[✅ Confirmación]
    K -->|Ir a mis citas| F

    style A fill:#e3f2fd,stroke:#1565c0
    style C fill:#fff3e0,stroke:#ef6c00
    style E fill:#e8f5e9,stroke:#2e7d32
    style I fill:#fce4ec,stroke:#c2185b
```

---

## Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as 👤 Usuario
    participant F as 📝 Formulario
    participant Z as 🗂️ authStore
    participant API as 🌐 Backend
    participant LS as 💾 localStorage

    U->>F: Ingresa credenciales
    F->>F: Validación Zod

    alt Validación exitosa
        F->>API: POST /auth/login
        API-->>F: {usuario, token}
        F->>Z: iniciarSesion(usuario, token)
        Z->>LS: Guardar estado
        Z-->>U: Redirigir a Dashboard
    else Error 401
        API-->>F: Credenciales incorrectas
        F-->>U: Mostrar error
    end

    Note over U,LS: Usuario autenticado

    U->>Z: Acceder ruta protegida
    Z->>Z: Verificar estaAutenticado

    alt Autenticado
        Z-->>U: Renderizar página
    else No autenticado
        Z-->>U: Redirigir a /login
    end
```

---

## Flujo de Reserva

### Vista General (5 Pasos)

```mermaid
stateDiagram-v2
    [*] --> SeleccionarServicio

    SeleccionarServicio --> SeleccionarFecha: setServicio()
    note right of SeleccionarFecha
        Reset fecha, personal, horario
    end note

    SeleccionarFecha --> SeleccionarPersonal: setFecha()
    note right of SeleccionarPersonal
        Reset personal, horario
        Filtra disponibles
    end note

    SeleccionarPersonal --> SeleccionarHorario: setPersonal()
    note right of SeleccionarHorario
        Reset horario
        Muestra slots por período
    end note

    SeleccionarHorario --> Confirmacion: setHorario()
    note right of Confirmacion
        Formulario contacto
        Validación Zod
    end note

    Confirmacion --> CitaCreada: POST /citas
    CitaCreada --> [*]

    Confirmacion --> SeleccionarHorario: Error 409 (slot ocupado)

    SeleccionarFecha --> SeleccionarServicio: Volver
    SeleccionarPersonal --> SeleccionarFecha: Volver
    SeleccionarHorario --> SeleccionarPersonal: Volver
    Confirmacion --> SeleccionarHorario: Volver
```

### Flujo Detallado con Estado

```mermaid
sequenceDiagram
    participant U as 👤 Usuario
    participant C as 🧩 Componente
    participant S as 🗂️ flujoReservaStore
    participant RQ as 🔄 React Query
    participant API as 🌐 Backend

    Note over U,API: PASO 1: Servicio
    U->>C: Click en servicio
    C->>S: setServicio(servicio)
    S->>S: Reset fecha, personal, horario

    Note over U,API: PASO 2: Fecha
    C->>RQ: useDisponibilidad({negocioId, servicioId})
    RQ->>API: GET /disponibilidad?servicio=X&semanas=1
    API-->>RQ: [{fecha, slots[]}]
    RQ-->>C: Render calendario
    U->>C: Click fecha
    C->>S: setFecha(fecha)
    S->>S: Reset personal, horario

    Note over U,API: PASO 3: Personal
    C->>C: Extraer personal de slots
    C-->>U: Mostrar opciones
    U->>C: Click personal
    C->>S: setPersonal(personal)
    S->>S: Reset horario

    Note over U,API: PASO 4: Horario
    C->>C: agruparSlotsPorPeriodo(slots)
    C-->>U: Mañana, Mediodía, Tarde
    U->>C: Click horario
    C->>S: setHorario(slot)

    Note over U,API: PASO 5: Confirmación
    C->>S: obtenerPasoActual()
    S-->>C: paso = 5
    U->>C: Completar formulario
    C->>C: Validar Zod (nombre, email, tel)

    alt Validación exitosa
        C->>C: generarClaveIdempotencia()
        C->>RQ: useCrearCita.mutate()
        RQ->>API: POST /citas<br/>Headers: Idempotency-Key

        alt Éxito
            API-->>RQ: {cita}
            RQ->>RQ: invalidateQueries(['citas'])
            RQ-->>C: onSuccess
            C->>S: reiniciarFlujo()
            C-->>U: Navigate /citas + Toast
        else Error 409
            API-->>RQ: Slot no disponible
            RQ->>RQ: invalidateQueries(['disponibilidad'])
            RQ-->>U: Toast error
        end
    end
```

---

## Gestión de Estado

### Zustand Stores

```mermaid
classDiagram
    class authStore {
        +Usuario? usuario
        +string? token
        +boolean estaAutenticado
        +iniciarSesion(usuario, token)
        +cerrarSesion()
        +setUsuario(usuario)
    }

    class flujoReservaStore {
        +string? negocioId
        +Servicio? servicioSeleccionado
        +Date? fechaSeleccionada
        +PersonalSimple? personalSeleccionado
        +HorarioDisponible? horarioSeleccionado
        +1|2|4 periodoVista
        +setNegocio()
        +setServicio()
        +setFecha()
        +setPersonal()
        +setHorario()
        +setPeriodoVista()
        +reiniciarFlujo()
        +volverAPaso(paso)
        +obtenerPasoActual()
        +puedeAvanzar(paso)
    }

    class localStorage {
        Persiste authStore
    }

    authStore --> localStorage
```

### React Query Cache

```mermaid
graph TB
    subgraph "🔄 React Query Client"
        A[queryClient]

        subgraph "Queries"
            Q1["['servicios', negocioId]<br/>staleTime: 30s"]
            Q2["['disponibilidad', params]<br/>polling: 30s"]
            Q3["['misCitas', filtros]"]
            Q4["['cita', negocioId, citaId]"]
            Q5["['negocio', negocioId]"]
            Q6["['citasNegocio', negocioId]<br/>polling: 60s"]
        end

        subgraph "Mutations"
            M1[crearCita]
            M2[cancelarCita]
            M3[iniciarEdicionCita]
            M4[confirmarEdicionCita]
            M5[guardarHorarios]
        end
    end

    M1 -->|Invalida| Q2 & Q3 & Q6
    M2 -->|Invalida| Q3 & Q4 & Q6
    M3 -->|Invalida| Q3 & Q4 & Q6
    M4 -->|Invalida| Q2 & Q3 & Q4 & Q6
    M5 -->|Invalida| Q2 & Q6

    style A fill:#e1f5ff,stroke:#01579b,stroke-width:2px
```

---

## API & Servicios

### Estructura de Servicios

```mermaid
graph TB
    subgraph "📡 API Client Layer"
        A[cliente.ts<br/>Axios Instance]

        A -->|BaseURL| B[VITE_API_URL]
        A -->|Timeout| C[10s]
        A -->|Interceptor Request| D[Inyectar JWT]
        A -->|Interceptor Response| E[Manejar 401]

        subgraph "Servicios"
            S1[auth.ts<br/>registrar, login]
            S2[servicios.ts<br/>obtener servicios]
            S3[disponibilidad.ts<br/>obtener slots]
            S4[citas.ts<br/>CRUD citas]
            S5[negocios.ts<br/>negocios, horarios, excepciones]
        end

        A --> S1 & S2 & S3 & S4 & S5
    end

    subgraph "🌐 Backend Endpoints"
        E1[POST /auth/registrar]
        E2[POST /auth/login]
        E3[GET /negocios/:id/servicios]
        E4[GET /negocios/:id/disponibilidad]
        E5[POST /negocios/:id/citas]
        E6[GET /citas]
        E7[PUT /citas/:id]
        E8[DELETE /citas/:id]
        E9[GET /negocios/:id]
        E10[POST /negocios/:id/horarios]
    end

    S1 --> E1 & E2
    S2 --> E3
    S3 --> E4
    S4 --> E5 & E6 & E7 & E8
    S5 --> E9 & E10

    style A fill:#e8f5e9,stroke:#1b5e20,stroke-width:3px
```

### Transformación de Datos

```mermaid
sequenceDiagram
    participant F as 🧩 Frontend (camelCase)
    participant S as 📡 Servicio API
    participant B as 🌐 Backend (snake_case)

    Note over F,B: Request
    F->>S: {servicioId, fechaInicio}
    S->>S: transformarASnakeCase()
    S->>B: {servicio_id, fecha_inicio}

    Note over F,B: Response
    B-->>S: {cita_id, fecha_hora_inicio}
    S->>S: transformarACamelCase()
    S-->>F: {citaId, fechaHoraInicio}
```

---

## Componentes Principales

### Jerarquía de Componentes

```mermaid
graph TB
    subgraph "📄 PaginaReserva"
        A[Container]

        A --> B{obtenerPasoActual}

        B -->|1| C1[ListaServicios]
        B -->|2| C2[Calendario]
        B -->|3| C3[SelectorPersonal]
        B -->|4| C4[GrillaHorarios]
        B -->|5| C5[ConfirmacionReserva]

        C1 --> D1[TarjetaServicio]
        C4 --> D2[GrupoHorarios]
        C5 --> D3[ResumenReserva]
        C5 --> D4[Formulario Contacto]
    end

    style A fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style B fill:#e1f5ff,stroke:#01579b,stroke-width:2px
```

### Componentes Comunes

```mermaid
graph LR
    subgraph "🔧 Componentes Reutilizables"
        A[Button]
        B[Input]
        C[EnvolvedorQuery]
        D[Notificacion]
        E[SpinnerCarga]
        F[DialogoConfirmacion]
        G[Header/Footer]
        H[RutaProtegida]
    end

    I[Páginas] --> A & B & C & D & E & F & G & H

    style A fill:#e8f5e9,stroke:#2e7d32
    style H fill:#ffebee,stroke:#c62828
```

---

## Validaciones y Seguridad

```mermaid
graph TB
    subgraph "✅ Capa de Validación"
        A[Formulario]

        A --> B[React Hook Form]
        B --> C[zodResolver]

        C --> D{Esquemas Zod}

        D --> E1[esquemaRegistro<br/>- Email válido<br/>- Contraseña 8+ chars<br/>- Teléfono 9XXXXXXXX]
        D --> E2[esquemaLogin<br/>- Email requerido<br/>- Contraseña requerida]
        D --> E3[esquemaContacto<br/>- Nombre 2-255 chars<br/>- Email válido<br/>- Teléfono válido]
    end

    subgraph "🔒 Seguridad"
        F[cliente.ts]
        F --> G[JWT en Authorization]
        F --> H[Interceptor 401 → Logout]
        F --> I[Timeout 10s]

        J[Idempotencia]
        J --> K[UUID v4 en Idempotency-Key]
        J --> L[Previene duplicados en citas]
    end

    style D fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style F fill:#ffebee,stroke:#c62828,stroke-width:2px
```

---

## Diagrama de Datos (Tipos)

```mermaid
erDiagram
    Usuario ||--o{ Cita : "crea"
    Usuario {
        string id
        string email
        string nombreCompleto
        string telefono
        string rol
    }

    Negocio ||--o{ Servicio : "tiene"
    Negocio ||--o{ HorarioNegocio : "tiene"
    Negocio ||--o{ FechaExcepcion : "tiene"
    Negocio ||--o{ Cita : "recibe"
    Negocio {
        string id
        string nombre
        string slug
        string duenoId
        boolean activo
    }

    Servicio ||--o{ Cita : "se reserva en"
    Servicio {
        string id
        string negocioId
        string nombre
        string descripcion
        number duracionMinutos
        number precioPen
        boolean activo
    }

    Cita {
        string id
        string negocioId
        string usuarioId
        string servicioId
        string personalId
        DateTime fechaHoraInicio
        DateTime fechaHoraFin
        string estado
        string numeroConfirmacion
    }

    HorarioNegocio {
        string id
        string negocioId
        number diaSemana
        string horaApertura
        string horaCierre
        boolean activo
    }

    FechaExcepcion {
        string id
        string negocioId
        Date fechaExcepcion
        string motivo
    }

    DisponibilidadDia ||--o{ SlotDisponible : "contiene"
    DisponibilidadDia {
        Date fecha
    }

    SlotDisponible {
        DateTime inicio
        DateTime fin
        PersonalSimple[] personalDisponible
    }
```

---

## Performance y Optimizaciones

```mermaid
graph TB
    subgraph "⚡ Estrategias de Performance"
        A[React Query]
        A --> A1[staleTime: 30s]
        A --> A2[Polling inteligente<br/>30s disponibilidad<br/>60s citas admin]
        A --> A3[Invalidación selectiva]

        B[React]
        B --> B1[useMemo para cálculos]
        B --> B2[Componentes pequeños]
        B --> B3[Lazy loading potencial]

        C[API]
        C --> C1[Timeout 10s]
        C --> C2[Retry solo en 5xx]
        C --> C3[Cache de servicios]
    end

    style A fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    style B fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style C fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
```

---

## Stack de Tecnologías

```mermaid
mindmap
  root((Agenda Salón<br/>Frontend))
    UI Framework
      React 19
      TypeScript
      Vite
    Estilos
      Tailwind CSS v4
      clsx
      tailwind-merge
    Routing
      React Router v7
      Navegación programática
    Formularios
      React Hook Form
      Zod
      @hookform/resolvers
    Data Fetching
      TanStack Query v5
      Axios
      Polling
    Estado Global
      Zustand
      localStorage persist
    Utilidades
      date-fns
      lucide-react iconos
      nanoid
    Dev Tools
      ESLint
      TypeScript v5.9
```

---

## Resumen de Archivos

| Categoría | Archivos | Descripción |
|-----------|----------|-------------|
| **Pages** | 9 | Componentes de página principal |
| **Components** | 40+ | Divididos en auth, citas, reservas, admin, comunes |
| **Hooks** | 22+ | Custom hooks con React Query |
| **Stores** | 2 | authStore, flujoReservaStore |
| **Servicios** | 6 | API clients (auth, citas, servicios, etc) |
| **Schemas** | 2 | Validaciones Zod |
| **Utils** | 3 | Helpers de fecha, idempotencia, Tailwind |
| **Tipos** | 100+ | Interfaces TypeScript |

---

## Próximos Pasos Potenciales

```mermaid
graph LR
    A[Sistema Actual] --> B[Mejoras]

    B --> C1[🔔 Notificaciones Push]
    B --> C2[💳 Pasarela de Pago]
    B --> C3[📊 Analytics Dashboard]
    B --> C4[🌐 i18n Multilenguaje]
    B --> C5[♿ Accesibilidad WCAG]
    B --> C6[📱 PWA Offline]
    B --> C7[🧪 Testing E2E]
    B --> C8[📈 Métricas Performance]

    style A fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style B fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
```

---

## Conclusión

✅ Arquitectura **modular y escalable**
✅ Separación clara de **responsabilidades**
✅ **Performance** optimizado con React Query
✅ **Validaciones** robustas con Zod
✅ **Estado global** bien gestionado
✅ **UX** fluida con loading states y notificaciones
✅ **Idempotencia** en operaciones críticas
✅ **TypeScript** para type-safety

Esta aplicación sigue las **mejores prácticas** de desarrollo moderno con React, asegurando **mantenibilidad**, **escalabilidad** y **excelente experiencia de usuario**.
