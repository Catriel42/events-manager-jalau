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
Demonstrates the login process using Google OAuth and JWT injection in the client:

```mermaid
sequenceDiagram
  autonumber
  actor User as User (Browser)
  participant UI as Angular Frontend
  participant API as NestJS Backend
  participant Provider as OAuth Provider (Google)

  User->>UI: Click on "Login with Google"
  UI->>API: Redirect to /auth/google
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

### 3. Calendar Synchronization Flow
Demonstrates how a user registers and syncs an event to their Google Calendar, avoiding duplicates:

```mermaid
sequenceDiagram
  autonumber
  actor User as User (Browser)
  participant UI as Angular Frontend
  participant API as NestJS Backend
  participant DB as Database (PostgreSQL)
  participant Provider as Calendar Provider (Google)

  User->>UI: Click "Add to Google Calendar" on Event Details
  UI->>API: POST /events/:id/sync-calendar (with Token)
  API->>DB: Check if Registration exists for User/Event
  DB-->>API: Registration Data
  alt Registration not found
      API-->>UI: Return 400 Bad Request
  else User registered
      API->>DB: Get full user details and OAuth tokens
      DB-->>API: Full User Record
      alt calendar_event_id already exists
          API->>Provider: Update existing calendar event (calendar_event_id)
          Provider-->>API: Update confirmation
      else calendar_event_id does not exist
          API->>Provider: Create new calendar event
          Provider-->>API: External Event ID & URL
          API->>DB: Save calendar_event_id to Registration
          DB-->>API: Saved
      end
      API-->>UI: Return { url } (201 Created)
      UI->>User: Open or display calendar event URL / confirmation
  end
```

---

## Backend API Reference

Base URL in local development: `http://localhost:3000`

### 1. Authentication (`/auth`)

#### `GET /auth/google`
* **Access**: Public
* **Description**: Initiates Google OAuth consent screen redirect.

#### `GET /auth/google/callback`
* **Access**: Public
* **Description**: Receives authorization code from Google, processes upsert, and redirects browser to the frontend with the access token.

#### `GET /auth/me`
* **Access**: Authenticated (JWT Bearer)
* **Response (200 OK)**:
  ```json
  {
    "id": "b3c9f28d-12ab-34cd-56ef-7890abcdef12",
    "full_name": "John Doe",
    "email": "john.doe@jala.university",
    "avatar_url": "https://example.com/avatar.jpg",
    "provider": "google",
    "role": "user",
    "created_at": "2026-05-25T12:00:00.000Z",
    "updated_at": "2026-05-25T12:00:00.000Z"
  }
  ```

#### `GET /auth/bypass`
* **Access**: Development Only (Blocked in Production)
* **Query Parameters**:
  * `email` (string, required) - Mock email address.
  * `name` (string, required) - Mock user full name.
* **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "b3c9f28d-12ab-34cd-56ef-7890abcdef12",
      "full_name": "John Doe",
      "email": "john.doe@jala.university",
      "avatar_url": null,
      "provider": "mock-bypass",
      "role": "user",
      "created_at": "2026-05-25T12:00:00.000Z",
      "updated_at": "2026-05-25T12:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

### 2. Events (`/events`)

#### `GET /events`
* **Access**: Public
* **Query Parameters**:
  * `page` (number, optional, default: 1)
  * `limit` (number, optional, default: 10)
  * `includeAll` (string, optional, default: 'false') - If 'true', includes drafts and cancelled events.
* **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "e5c6a1d8-4321-abcd-ef01-23456789abcd",
        "title": "Introduction to AI Agent Systems",
        "description": "Learn how to build autonomous agentic workflows...",
        "location": "Jala University Main Auditorium",
        "meeting_url": null,
        "event_type": "in_person",
        "status": "published",
        "starts_at": "2026-06-01T14:00:00.000Z",
        "ends_at": "2026-06-01T17:00:00.000Z",
        "capacity": 50,
        "banner_url": null,
        "calendar_uid": "uid-ai-agents-2026",
        "created_at": "2026-05-25T12:00:00.000Z",
        "updated_at": "2026-05-25T12:00:00.000Z",
        "tags": [
          { "id": "tag-1", "name": "AI", "slug": "ai" }
        ]
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

#### `GET /events/my`
* **Access**: Authenticated (JWT Bearer)
* **Query Parameters**:
  * `status` (string, optional) - Filter by event status ('draft', 'published', 'cancelled', 'completed').
  * `page` (number, optional, default: 1)
  * `limit` (number, optional, default: 10)
* **Response (200 OK)**: Same structure as `GET /events`.

#### `GET /events/:id`
* **Access**: Public
* **Response (200 OK)**:
  ```json
  {
    "id": "e5c6a1d8-4321-abcd-ef01-23456789abcd",
    "title": "Introduction to AI Agent Systems",
    "description": "Learn how to build autonomous agentic workflows...",
    "location": "Jala University Main Auditorium",
    "meeting_url": null,
    "event_type": "in_person",
    "status": "published",
    "starts_at": "2026-06-01T14:00:00.000Z",
    "ends_at": "2026-06-01T17:00:00.000Z",
    "capacity": 50,
    "banner_url": null,
    "calendar_uid": "uid-ai-agents-2026",
    "created_at": "2026-05-25T12:00:00.000Z",
    "updated_at": "2026-05-25T12:00:00.000Z",
    "tags": [
      { "id": "tag-1", "name": "AI", "slug": "ai" }
    ],
    "registered_count": 5
  }
  ```

#### `POST /events`
* **Access**: Admin (JWT Bearer)
* **Request Body**:
  ```json
  {
    "title": "Introduction to AI Agent Systems",
    "description": "Learn how to build autonomous agentic workflows...",
    "location": "Jala University Main Auditorium",
    "event_type": "in_person",
    "starts_at": "2026-06-01T14:00:00.000Z",
    "ends_at": "2026-06-01T17:00:00.000Z",
    "capacity": 50,
    "tag_ids": ["tag-1-uuid"]
  }
  ```
* **Response (201 Created)**: Created event object with its tags array.

#### `PUT /events/:id`
* **Access**: Admin (JWT Bearer)
* **Request Body**: Partial event details (identical format to `POST /events` body).
* **Response (200 OK)**: Updated event object with its tags array.

#### `DELETE /events/:id`
* **Access**: Admin (JWT Bearer)
* **Response (200 OK)**:
  ```json
  {
    "success": true
  }
  ```

#### `POST /events/:id/sync-calendar`
* **Access**: Authenticated (JWT Bearer)
* **Response (201 Created)**:
  ```json
  {
    "url": "https://calendar.google.com/calendar/r/eventedit?..."
  }
  ```

---

### 3. Event Registrations (`/events/:eventId/registrations`)

#### `POST /events/:eventId/registrations`
* **Access**: Authenticated (JWT Bearer)
* **Response (201 Created)**:
  ```json
  {
    "id": "reg-9876-uuid",
    "event_id": "e5c6a1d8-4321-abcd-ef01-23456789abcd",
    "user_id": "b3c9f28d-12ab-34cd-56ef-7890abcdef12",
    "status": "confirmed",
    "waitlist_position": null,
    "token": "registration-verification-token-uuid",
    "calendar_event_id": null,
    "registered_at": "2026-05-27T01:00:00.000Z",
    "cancelled_at": null
  }
  ```
  *Note: If the capacity is exhausted, the status returns `'waitlisted'` and the `waitlist_position` will be a number.*

#### `GET /events/:eventId/registrations`
* **Access**: Authenticated (JWT Bearer)
* **Response (200 OK)**: Returns the user's registration object (same schema as `POST` response above) or `null` if not registered.

#### `DELETE /events/:eventId/registrations`
* **Access**: Authenticated (JWT Bearer)
* **Response (200 OK)**: Empty body.

#### `GET /events/:eventId/registrations/all`
* **Access**: Admin (JWT Bearer)
* **Response (200 OK)**:
  ```json
  [
    {
      "id": "reg-9876-uuid",
      "status": "confirmed",
      "user_id": "user-id-uuid",
      "event_id": "event-id-uuid",
      "user": {
        "id": "user-id-uuid",
        "full_name": "John Doe",
        "email": "john.doe@jala.university",
        "avatar_url": null
      }
    }
  ]
  ```

---

### 4. Global Registrations (`/registrations`)

#### `GET /registrations`
* **Access**: Admin (JWT Bearer)
* **Response (200 OK)**:
  ```json
  [
    {
      "id": "reg-uuid",
      "event_id": "event-uuid",
      "user_id": "user-uuid",
      "status": "confirmed",
      "waitlist_position": null,
      "token": "token-uuid",
      "registered_at": "2026-05-27T01:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "full_name": "John Doe",
        "email": "john@example.com",
        "avatar_url": null
      },
      "event": {
        "id": "event-uuid",
        "title": "AI Event",
        "starts_at": "2026-06-01T14:00:00.000Z",
        "event_type": "in_person"
      }
    }
  ]
  ```

#### `PATCH /registrations/:id/status`
* **Access**: Admin (JWT Bearer)
* **Request Body**:
  ```json
  {
    "status": "confirmed"
  }
  ```
* **Response (200 OK)**: Updated global registration object.

#### `DELETE /registrations/:id`
* **Access**: Admin (JWT Bearer)
* **Response (200 OK)**: Empty body.

---

### 5. Tags (`/tags`)

#### `GET /tags`
* **Access**: Public
* **Response (200 OK)**:
  ```json
  [
    {
      "id": "tag-id-1",
      "name": "AI",
      "slug": "ai"
    }
  ]
  ```

#### `GET /tags/:id`
* **Access**: Public
* **Response (200 OK)**: Tag object details.

#### `POST /tags`
* **Access**: Admin (JWT Bearer)
* **Request Body**:
  ```json
  {
    "name": "New Tag",
    "slug": "new-tag"
  }
  ```
* **Response (201 Created)**: Created tag object.

#### `PATCH /tags/:id`
* **Access**: Admin (JWT Bearer)
* **Request Body**: Partial tag details (name, slug).
* **Response (200 OK)**: Updated tag object.

#### `DELETE /tags/:id`
* **Access**: Admin (JWT Bearer)
* **Response (200 OK)**: Deleted tag object details.

---

### 6. Users (`/users`)

#### `GET /users`
* **Access**: Admin (JWT Bearer)
* **Response (200 OK)**: Array of all registered user objects.

#### `GET /users/:id`
* **Access**: Admin (JWT Bearer)
* **Response (200 OK)**: Specific user object details.

#### `PATCH /users/:id`
* **Access**: Admin (JWT Bearer)
* **Request Body**:
  ```json
  {
    "role": "admin"
  }
  ```
* **Response (200 OK)**: Updated user object.

#### `DELETE /users/:id`
* **Access**: Admin (JWT Bearer)
* **Response (200 OK)**: Deleted user object details.

---

### 7. File Uploads (`/files`)

#### `POST /files/upload`
* **Access**: Public
* **Request Body**: `multipart/form-data` with `file` key containing the image file.
* **Response (201 Created)**:
  ```json
  {
    "url": "https://res.cloudinary.com/ds9u5rzqv/image/upload/v1234/filename.jpg",
    "public_id": "filename_public_id"
  }
  ```

---

### 8. Health Check (`/health`)

#### `GET /health`
* **Access**: Public
* **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-05-27T01:00:00.000Z"
  }
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