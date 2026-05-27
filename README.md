# Event Manager - Jala U

Monorepo for the Jala University Events Management Platform. Built with **NestJS 11**, **Angular v21**, and **Prisma 7**.

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