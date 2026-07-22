# FoodBridge AI — Memory

## Project overview

Backend API for intelligent food redistribution. Built with Node.js, Express, TypeScript, MongoDB, Redis, and BullMQ. Following clean layered architecture.

## Tech stack

Node.js, Express.js, TypeScript, MongoDB, Mongoose, Redis (ioredis), BullMQ, Socket.IO, JWT, Docker, Swagger (swagger-jsdoc + swagger-ui-express), Winston, Zod, Jest, GitHub Actions

## Architecture

```
Routes → Controllers → Services → Repositories → Database
```

- Controllers parse HTTP requests, delegate to services, format responses. No business logic.
- Services contain all business logic and orchestrate between repositories.
- Repositories are the only layer that touches MongoDB directly.

## What has been built

### Phase 1 — Project foundation (completed)

**Root config files:**
- `package.json` — all deps, scripts (dev, build, start, lint, format, test, docker)
- `tsconfig.json` — ES2022 target, strict, path aliases (`@config/*`, `@utils/*`, etc.)
- `nodemon.json` — ts-node with tsconfig-paths, watches `src/`
- `eslint.config.mjs` — ESLint 9 flat config, typescript-eslint, warns on console/any
- `.prettierrc` — single quotes, trailing commas, 100-char width, LF
- `.editorconfig` — cross-editor whitespace rules
- `.gitignore` — node_modules, dist, .env, logs, IDE files, coverage
- `jest.config.ts` — ts-jest, module name mapper mirrors tsconfig paths
- `Dockerfile` — multi-stage (builder → production), non-root user, healthcheck
- `docker-compose.yml` — API + Mongo 7 + Redis 7, healthchecks, named volumes, bridge network
- `.env.example` — every env var with defaults
- `README.md` — quick start, scripts table, folder structure, architecture overview

**src/config/** — Centralized settings
- `env.config.ts` — single source of truth for all env vars, typed, parsed at startup
- `swagger.config.ts` — OpenAPI 3.0 spec generated from JSDoc, JWT scheme pre-registered
- `index.ts` — barrel export

**src/database/** — Connection management
- `mongo.connection.ts` — Mongoose connect with pool sizing (10), timeouts, auto-index off in prod, graceful disconnect
- `redis.connection.ts` — ioredis singleton, `maxRetriesPerRequest: null` for BullMQ, exponential backoff retry, connect/get/disconnect exports
- `index.ts` — barrel export

**src/middlewares/** — Request pipeline
- `security.middleware.ts` — Helmet, CORS (configurable origin), compression (1KB threshold), Morgan piped to Winston, rate limiter (env-configured)
- `base.middleware.ts` — request ID correlation, request timing logger
- `error.middleware.ts` — global error handler catching Mongoose validation/duplicate-key, JWT errors, AppError, and unknown errors
- `index.ts` — barrel export

**src/utils/** — Shared tools
- `logger.ts` — Winston, colorized dev format, structured JSON for prod, file rotation (5MB x 5), silent in test
- `asyncHandler.ts` — wraps async route handlers, forwards rejections to global error handler
- `apiResponse.ts` — uniform JSON envelope `{ success, statusCode, message, data?, meta? }`, static helpers for all common status codes, paginated helper
- `appError.ts` — typed operational error with `isOperational` flag and status code
- `index.ts` — barrel export

**src/controllers/**
- `health.controller.ts` — delegates to HealthService, returns 200 or 503
- `index.ts` — barrel export

**src/services/**
- `health.service.ts` — pings Mongo and Redis, measures latency, returns healthy/degraded/unhealthy
- `index.ts` — barrel export

**src/routes/**
- `health.routes.ts` — `GET /health`
- `index.ts` — central router, mounts health routes

**src/types/**
- `index.ts` — `AuthenticatedRequest`, `PaginationQuery` interfaces

**Core files:**
- `app.ts` — Express assembly in correct order: helmet → cors → compression → body parsing → request ID → request logger → morgan → rate limiter → swagger docs → routes → 404 → global error handler
- `server.ts` — connects Mongo + Redis, starts listening, graceful shutdown on SIGTERM/SIGINT (10s timeout), process-level unhandledRejection and uncaughtException traps

**Placeholder directories (with .gitkeep):**
- `src/models/` — Mongoose schemas
- `src/repositories/` — data access layer
- `src/validations/` — Zod schemas
- `src/jobs/` — BullMQ job processors
- `src/events/` — Socket.IO event handlers
- `tests/` — test files
- `.github/workflows/` — CI/CD pipelines
- `logs/` — Winston file output

### Verification results

| Check | Result |
|-------|--------|
| npm install | 643 packages, 0 vulnerabilities |
| tsc --noEmit | 0 errors |
| jest --passWithNoTests | Pass |

## API endpoints

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| GET | /api/v1/health | Health check (Mongo + Redis ping) | Done |
| GET | /api/v1/docs | Swagger UI | Done |

## What has NOT been built yet

- Authentication (JWT, registration, login, refresh tokens)
- User model and RBAC
- Donation/food listing models and CRUD
- Zod validation schemas
- BullMQ job queues
- Socket.IO real-time events
- GitHub Actions CI/CD pipeline
- Integration/e2e tests
- Any business logic

## Key decisions

- **Path aliases** (`@config/*`, `@utils/*`, etc.) for clean imports as codebase grows
- **`maxRetriesPerRequest: null`** on Redis — required by BullMQ
- **Auto-index disabled in production** on Mongoose — indexes should be managed via migrations
- **Non-root Docker user** — security best practice
- **Morgan pipes to Winston** at `http` level — single logging pipeline
- **`isOperational` flag on AppError** — lets the global error handler distinguish expected errors from bugs
- **10-second forced shutdown timeout** — prevents zombie containers
- **`http-status-codes` removed from ApiResponse defaults** — used plain strings to avoid ReasonPhrases enum type conflicts with custom messages

## Commit history

```
chore: initialize production backend architecture
```
