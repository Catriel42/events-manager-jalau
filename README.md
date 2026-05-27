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

## Project Structure

Below is the key directory layout of the monorepo:

```
events-manager-jalau/
├── backend/               # NestJS 11 API Server
│   ├── prisma/            # Database schema and Prisma migrations
│   ├── src/               # Backend source code (Auth, Events, Registrations, etc.)
│   └── test/              # NestJS E2E integration tests
├── frontend/              # Angular v21 SPA web application (Zoneless)
│   ├── e2e/               # Automated UI testing with Playwright
│   └── src/               # Angular components, services, and layouts
├── k6/                    # k6 performance and load testing scripts
├── shared/                # Shared TypeScript models and contracts
└── docker-compose.yml     # Local orchestration for PostgreSQL and k6
```

---

## Main Application Flows

### 1. OAuth Authentication Flow
Demonstrates the login process using external identity providers (Google or Microsoft) and JWT injection in the client:

```mermaid
sequenceDiagram
  autonumber
  actor User as User (Browser)
  participant UI as Angular Frontend
  participant API as NestJS Backend
  participant Provider as OAuth Provider (Google/Microsoft)

  User->>UI: Click on "Login with Google/Microsoft"
  UI->>API: Redirect to /auth/google or /auth/microsoft
  API->>Provider: Redirect with Client ID and Scopes
  Provider-->>User: Prompt for Credentials and Consent
  User->>Provider: Authorize
  Provider-->>API: Temporary callback with Authorization Code
  API->>Provider: Exchange Authorization Code for User Profile
  API->>API: Find or create user (Upsert)
  API->>API: Sign JWT token with JWT_SECRET
  API-->>UI: Redirect to /auth/callback?token=JWT_TOKEN
  UI->>UI: Store JWT in localStorage ("token")
  UI->>API: GET /auth/me (with Authorization Header)
  API-->>UI: Return profile data (Id, Name, Role)
  UI->>User: Redirect to Dashboard or Events (Logged In)
```

### 2. Event Registration Flow (with Waitlist)
Demonstrates the business logic when a user registers for an event, managing capacity limits and sending confirmation emails:

```mermaid
sequenceDiagram
  autonumber
  actor User as User (Browser)
  participant UI as Angular Frontend
  participant API as NestJS Backend
  participant DB as Database (PostgreSQL)
  participant Email as Email Service (Resend)

  User->>UI: Click "Register" on Event Details
  UI->>API: POST /events/:id/registrations (with Token)
  API->>DB: Retrieve Event (Status and Capacity)
  DB-->>API: Event Data
  API->>DB: Query if Registration exists
  DB-->>API: null
  alt Capacity Available
      API->>DB: Create registration with status="confirmed"
      DB-->>API: Confirmed
      API->>Email: Send Confirmation Email (void/background)
  else Capacity Exhausted
      API->>DB: Count confirmed registrations for the Event
      API->>DB: Find last position on waitlist
      DB-->>API: Position N
      API->>DB: Create registration with status="waitlisted" and position N+1
      DB-->>API: Waitlisted
      API->>Email: Send Waitlist Email (void/background)
  end
  API-->>UI: Return Registration details (201 Created)
  UI->>User: Show "You're registered!" or position on Waitlist
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