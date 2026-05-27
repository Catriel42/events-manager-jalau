# Event Manager - Jala U

Monorepo for the Jala University Events Management Platform. Built with **NestJS 11**, **Angular v21**, and **Prisma 7**.

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.io/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-24-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?style=flat-square&logo=playwright&logoColor=white)](https://playwright.dev/)
[![k6](https://img.shields.io/badge/k6-Load--Testing-7C6BFF?style=flat-square&logo=k6&logoColor=white)](https://k6.io/)

---

## Estructura del Proyecto

A continuación se detalla la distribución de directorios clave del monorepositorio:

```
events-manager-jalau/
├── backend/               # Servidor de API en NestJS 11
│   ├── prisma/            # Esquema de base de datos y migraciones de Prisma
│   ├── src/               # Código fuente del backend (Auth, Events, Registrations, etc.)
│   └── test/              # Pruebas de integración E2E de NestJS
├── frontend/              # Aplicación web SPA en Angular v21 (Zoneless)
│   ├── e2e/               # Pruebas automatizadas de interfaz de usuario con Playwright
│   └── src/               # Componentes, servicios e layouts de Angular
├── k6/                    # Scripts de pruebas de rendimiento y carga con k6
├── shared/                # Modelos y contratos de TypeScript compartidos
└── docker-compose.yml     # Orquestación local para PostgreSQL y k6
```

---

## Flujos Principales de la Aplicación

### 1. Flujo de Autenticación con OAuth
Muestra el proceso de inicio de sesión utilizando proveedores externos (Google o Microsoft) e inyección del token JWT en el cliente:

```mermaid
sequenceDiagram
  autonumber
  actor User as Usuario (Browser)
  participant UI as Frontend Angular
  participant API as Backend NestJS
  participant Provider as Proveedor OAuth (Google/Microsoft)

  User->>UI: Clic en "Login con Google/Microsoft"
  UI->>API: Redireccionar a /auth/google o /auth/microsoft
  API->>Provider: Redireccionar con Client ID y Scopes
  Provider-->>User: Solicitar Credenciales y Aprobación
  User->>Provider: Autorizar
  Provider-->>API: Callback temporal con Código de Autorización
  API->>Provider: Intercambiar Código por Perfil del Usuario
  API->>API: Buscar o crear usuario (Upsert)
  API->>API: Firmar token JWT con JWT_SECRET
  API-->>UI: Redireccionar a /auth/callback?token=JWT_TOKEN
  UI->>UI: Guardar JWT en localStorage ("token")
  UI->>API: GET /auth/me (con Authorization Header)
  API-->>UI: Retorna datos de perfil (Id, Nombre, Rol)
  UI->>User: Redireccionar a Dashboard o Eventos (Logueado)
```

### 2. Flujo de Registro a Eventos (con Lista de Espera)
Muestra la lógica de negocio cuando un usuario se inscribe en un evento, administrando la capacidad máxima y enviando confirmaciones:

```mermaid
sequenceDiagram
  autonumber
  actor User as Usuario (Browser)
  participant UI as Frontend Angular
  participant API as Backend NestJS
  participant DB as Base de Datos (Postgres)
  participant Email as Servicio de Correo (Resend)

  User->>UI: Clic en "Register" en Detalles del Evento
  UI->>API: POST /events/:id/registrations (con Token)
  API->>DB: Consultar Evento (Estado y Capacidad)
  DB-->>API: Datos del Evento
  API->>DB: Consultar si ya tiene Registro
  DB-->>API: null
  alt Capacidad Disponible
      API->>DB: Crear registro con status="confirmed"
      DB-->>API: Confirmado
      API->>Email: Enviar correo de Confirmación (void/segundo plano)
  else Capacidad Agotada
      API->>DB: Contar registros confirmados para el Evento
      API->>DB: Buscar última posición en lista de espera
      DB-->>API: Posición N
      API->>DB: Crear registro con status="waitlisted" y posición N+1
      DB-->>API: En lista de espera
      API->>Email: Enviar correo de Lista de Espera (void/segundo plano)
  end
  API-->>UI: Retorna detalles de la Registración (201 Created)
  UI->>User: Muestra "You're registered!" o posición en Lista de Espera
```

---

## Prerequisites

Ensure you have the following installed:
- **Node.js**: v20.x or higher
- **NPM**: v10.x or higher
- **Docker & Docker Compose**: For local PostgreSQL database

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Catriel42/events-manager-jalau.git
cd events-manager-jalau
```

### 2. Environment Setup

#### Root Directory
Create a `.env` file in the root directory for Docker Compose:
```env
POSTGRES_DB=eventmanager_dev
POSTGRES_USER=eventmanager
POSTGRES_PASSWORD=eventmanager
```

#### Backend Directory
Create a `backend/.env` file:
```env
DATABASE_URL="postgresql://eventmanager:eventmanager@localhost:5432/eventmanager_dev?schema=public"
```

### 3. Spin up Infrastructure
```bash
docker compose up -d
```

### 4. Install Dependencies & Setup Database

**Backend:**
```bash
cd backend
npm install
npx prisma migrate dev --name init
```

**Frontend:**
```bash
cd ../frontend
npm install
```

---

## Development Commands

### Backend
Run from `backend/` folder:
- `npm run start:dev`: Start NestJS in watch mode
- `npm run db:studio`: Open Prisma Studio (DB GUI)
- `npm run db:migrate`: Apply new migrations

### Frontend
Run from `frontend/` folder:
- `npm run dev`: Start Angular dev server
- `npm run build`: Build production bundle

---

## Architecture & Conventions

This project follows strict conventions defined in [AGENTS.md](./AGENTS.md).
- **Backend**: Clean Architecture (Domain, Application, Infrastructure).
- **Frontend**: Angular v21 (Zoneless, Signals, No-Suffix naming).
- **Shared**: Common types and interfaces are located in `shared/types`.

---

## CI/CD
A GitHub Actions pipeline is configured to validate every Pull Request.
- **Jobs**: Backend (Lint, Build, Test), Frontend (Build).

---

## Testing

The project is equipped with automated end-to-end (E2E) UI testing and high-concurrency API load testing.

### 1. E2E UI Testing (Playwright)

We use Playwright within the frontend directory to validate the user interface. It simulates standard user journeys (e.g., viewing catalog, inspecting event details, registering, syncing calendars, and cancelling) using mock API responses.

**Commands (run from the `frontend/` directory):**
- **Headless execution** (fast CLI test run):
  ```bash
  npm run test:e2e
  ```
- **Interactive UI Runner** (opens a graphical dashboard to view browser clicks, timelines, and console logs):
  ```bash
  npm run test:e2e:ui
  ```

### 2. Load and Performance Testing (k6)

We use k6 to stress test the NestJS API and the database under high concurrency. It simulates up to 100+ Virtual Users (VUs) simultaneously executing authentication bypass, catalog browsing, event detail loading, and registration.

**Prerequisites:**
- Local PostgreSQL Docker container is running.
- Local backend is running (`cd backend && npm run start:dev`).

**Command (run from the root directory):**
```bash
docker compose run --rm k6 run /scripts/load-test.js
```
*(This starts a temporary k6 container that hooks directly into your local machine's `localhost:3000` port using host-network bridging, keeping your system clean).*