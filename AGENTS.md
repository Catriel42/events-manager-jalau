# Project Intelligence — Event Manager

## Project Overview

Monorepo with `backend/` (NestJS 11) and `frontend/` (Angular v21.2). Shared types live in `shared/types/`.

---

## Angular v21 Conventions (Frontend)

### Clean Naming (No Suffixes)
In modern Angular (v21+), suffixes like `Component`, `Service`, `Pipe`, `Guard` are completely omitted in class names, file names, and directories to reduce verbosity and avoid redundancy.
- **Why?**
  - **Context-driven:** The directory path (e.g., `features/events/event-list/`), the file extension (`.ts`, `.html`), and the decorator (`@Component`, `@Injectable`) already make the type of file clear.
  - **Readability:** Imports and references are shorter and cleaner (e.g., `import { EventList } from './event-list'` instead of `import { EventListComponent } from './event-list.component'`).
  - **Modern alignment:** It aligns with other modern web frameworks (React, Vue, Svelte) which define components simply as their logical name.
- **File Naming Examples:**
  - Components: `event-list.ts`, NOT `event-list.component.ts`.
  - Services: `auth.ts`, NOT `auth.service.ts`.
  - Guards: `auth-guard.ts`, NOT `auth.guard.ts`.
  - Pipes: `date-format.ts`, NOT `date-format.pipe.ts`.
- **Class Naming Examples:**
  - Components: `export class EventList`, NOT `export class EventListComponent`.
  - Services: `export class Auth`, NOT `export class AuthService`.

### File Separation (HTML and TS)
- **Separate Template Files:** Every component must separate its presentation layer (HTML) and its logic (TypeScript) into individual files (e.g., `event-list.html` and `event-list.ts`).
- **No Inline Templates:** Using the inline `template: ...` property inside the `@Component` decorator is prohibited to ensure clean codebase organization and separation of concerns.

### Reactivity with Signals
- **Mandatory Signals:** All state, inputs, and outputs must be implemented using Angular Signals.
- **State Management:** Use `signal()` and `computed()` for reactive state. Do not use standard mutable class properties or RxJS subjects for internal component state unless integrating with external asynchronous streams.
- **Component I/O:** Use modern signal inputs and outputs:
  - Inputs: `input()` or `input.required()`.
  - Outputs: `output()`.

### Functional Dependency Injection
- **Mandatory inject():** Use the functional `inject()` function at the class level for dependency injection.
- **No Constructor Injection:** Constructor-based injection (`constructor(private auth: Auth)`) is strictly prohibited. Constructors should only be used for initialization if required, though lifecycle management is preferred via `effect()` or standard reactivity.

### Decorators and Control Flow
- **standalone is the default:** Do NOT write `standalone: true` in component decorators.
- **Zoneless is the default:** Do NOT use `ChangeDetectionStrategy.OnPush`. Signals notify Angular automatically.
- **No legacy lifecycle hooks:** Do NOT use `ngOnInit`, `ngOnChanges`, or `ngOnDestroy`. Use `inject(DestroyRef)` for cleanup and `effect()` for side effects.
- **Native control flow:** Use `@if`, `@for`, and `@switch`. Do not use `*ngIf`, `*ngFor`, or `*ngSwitch`.
- **Styling bindings:** Use class bindings (`[class.some-class]="condition"`) and style bindings (`[style.color]="someColor"`) instead of `ngClass` and `ngStyle`.

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
