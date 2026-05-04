# Project Intelligence — Event Manager

## Project Overview

Monorepo with `backend/` (NestJS 11) and `frontend/` (Angular v21.2). Shared types live in `shared/types/`.

---

## Angular v21 Conventions (Frontend)

### File Naming
- **NO type suffixes in filenames.** Use `login-page.ts`, NOT `login-page.component.ts`.
- Services: `auth.ts`, NOT `auth.service.ts`.
- Guards: `auth-guard.ts`, NOT `auth.guard.ts`.
- Pipes: `date-format.ts`, NOT `date-format.pipe.ts`.

### Class Naming
- **NO suffix in class names.** Use `export class LoginPage`, NOT `export class LoginPageComponent`.
- Services: `export class Auth`, or descriptive names like `export class AuthService` only if needed for clarity.

### Component Patterns
- **standalone is the default.** Do NOT write `standalone: true` in decorators.
- **Zoneless is the default in v21.** Do NOT use `ChangeDetectionStrategy.OnPush`. Signals notify Angular automatically.
- **No lifecycle hooks.** Do NOT use `ngOnInit`, `ngOnChanges`, `ngOnDestroy`. Use:
  - `inject()` for dependency injection (not constructor injection)
  - `signal()`, `computed()` for state
  - `input()`, `output()` for component I/O
  - `effect()` for side effects
  - `DestroyRef` for cleanup
  - `afterNextRender()` for DOM access
- **Native control flow.** Use `@if`, `@for`, `@switch`. NOT `*ngIf`, `*ngFor`, `*ngSwitch`.
- **Reactive Forms** over Template-driven forms.
- Use `class` bindings, NOT `ngClass`. Use `style` bindings, NOT `ngStyle`.

### Architecture
```
src/app/
├── core/         → Singletons: guards, interceptors, global services
├── shared/       → Reusable: ui components, pipes, directives
└── features/     → Feature modules, each with:
    ├── domain/         → Interfaces, enums, value objects
    ├── application/    → Use cases, state management
    ├── infrastructure/ → API services, adapters
    └── ui/             → Components (pages and presentational)
```

---

## NestJS Conventions (Backend)

### Architecture
- **Clean Architecture** per module: `domain/`, `application/`, `infrastructure/`
- **One module per business entity**, NOT per table. Pivot tables are managed by the parent entity's module.
- `PrismaModule` is `@Global()` — no need to import it in each module.

### File Naming
- NestJS keeps its standard suffixes: `.module.ts`, `.controller.ts`, `.service.ts`.

### Path Aliases
- Use `@app/`, `@common/`, `@users/`, `@events/`, etc. (configured in `tsconfig.json`).

---

## Git Conventions

### Branching (GitHub Flow)
- Branch from `main`: `{action}/us-{id}-{title}`
- Actions: `feature`, `fix`, `bug`, `chore`, `docs`, `refactor`
- Example: `feature/us-001-scaffolding`

### Commits (Conventional Commits)
- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Example: `feat(auth): add Google OAuth strategy`

---

## Tech Stack
- **Frontend:** Angular v21.2, Tailwind CSS v4, Vitest
- **Backend:** NestJS 11, Prisma, PostgreSQL
- **Auth:** Google OAuth + Microsoft Entra ID (upsert by email)
- **Email:** Resend
- **Hosting:** Vercel (frontend), Railway (backend), Neon/Supabase (DB)
