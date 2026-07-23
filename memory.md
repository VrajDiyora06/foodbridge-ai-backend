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

### Phase 2 — Authentication: User model (completed)

**src/models/**
- `user.model.ts` — Mongoose User schema with full auth support

Enums:
- `UserRole`: user, donor, ngo, volunteer, admin
- `AccountStatus`: active, inactive, suspended

Schema fields:
- `name` — string, required, trimmed, 2-50 chars
- `email` — string, required, unique, lowercase, regex-validated, indexed
- `password` — string, required, min 8 chars, `select: false` (excluded from queries by default)
- `role` — UserRole enum, defaults to 'user'
- `accountStatus` — AccountStatus enum, defaults to 'active'
- `isVerified` — boolean, defaults to false (email verification)
- `passwordChangedAt` — Date or null (used to invalidate tokens issued before a password change)
- `lastLoginAt` — Date or null
- `createdAt` / `updatedAt` — auto via Mongoose timestamps

Indexes:
- `email` — unique (from schema `unique: true`)
- `{ role: 1, accountStatus: 1 }` — compound, for admin dashboard filtered queries
- `{ email: 1, isVerified: 1 }` — compound, speeds up login verification checks

Instance methods:
- `isPasswordChangedAfter(jwtIssuedAt)` — returns true if password changed after the token was issued, used by auth middleware to reject stale tokens

JSON/Object serialization (toJSON, toObject transforms):
- Renames `_id` to `id`
- Strips `__v`, `password`, `passwordChangedAt`
- Typed `ret` as `Record<string, unknown>` to satisfy TypeScript strict mode delete operator

Interfaces exported:
- `IUser` — plain data shape
- `IUserDocument` — extends IUser + Document, includes _id typing and instance methods

**src/repositories/**
- `user.repository.ts` — data access layer for the User collection

Methods:
- `create(data)` — insert a new user (password must already be hashed by caller)
- `findByEmail(email)` — lookup by email, no password
- `findById(id)` — lookup by ObjectId, no password
- `findByIdWithPassword(id)` — includes password field (for password reset)
- `findByEmailWithPassword(email)` — includes password field (for login)
- `existsByEmail(email)` — boolean check using `countDocuments` with `limit(1)`
- `updatePassword(userId, hashedPassword)` — replace hash, set `passwordChangedAt`
- `markEmailVerified(userId)` — set `isVerified = true`
- `updateLastLogin(userId)` — stamp `lastLoginAt`
- `deactivateUser(userId)` — set `accountStatus = inactive`
- `activateUser(userId)` — set `accountStatus = active`

All update methods return the updated document (`{ new: true }`).
All read methods use `.lean()` for plain JS objects (faster, lower memory).

Exported types:
- `CreateUserData` — input interface for the `create` method

### Phase 2 — Authentication: Validation schemas (completed)

**src/validations/**
- `auth.validation.ts` — six Zod schemas for auth request bodies

Schemas:
- `registerSchema` — name (trim, 2-50), email (valid, lowercase), password (8-128, uppercase+lowercase+digit+special), confirmPassword (must match), role (optional, defaults to 'user')
- `loginSchema` — email, password (min 1, no complexity rules — don't leak policy on login)
- `verifyEmailSchema` — token (non-empty string)
- `forgotPasswordSchema` — email
- `resetPasswordSchema` — token, password (same rules as register), confirmPassword (must match)
- `refreshTokenSchema` — refreshToken (non-empty string)

Reusable internals:
- `passwordField` — shared Zod chain for password validation (register + reset)
- `emailField` — shared email chain with lowercase + trim
- `PASSWORD_REGEX` — lookahead regex requiring uppercase, lowercase, digit, special char

Exported DTO types (via `z.infer`):
- `RegisterDto`, `LoginDto`, `VerifyEmailDto`, `ForgotPasswordDto`, `ResetPasswordDto`, `RefreshTokenDto`

**src/middlewares/**
- `validate.middleware.ts` — generic middleware accepting any ZodSchema, parses req.body, replaces it with clean output, returns 400 with per-field errors on failure
- Added to `middlewares/index.ts` barrel export

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

- Authentication logic (JWT, registration, login, refresh tokens, middleware)
- Auth controller, service, routes
- Token service (JWT + Redis token management)
- Crypto utility (secure random token generation)
- Auth rate limiting
- Donation/food listing models and CRUD
- BullMQ job queues
- Socket.IO real-time events
- GitHub Actions CI/CD pipeline
- Integration/e2e tests
- Email sending (SMTP/SendGrid)

## Key decisions

- **Path aliases** (`@config/*`, `@utils/*`, etc.) for clean imports as codebase grows
- **`maxRetriesPerRequest: null`** on Redis — required by BullMQ
- **Auto-index disabled in production** on Mongoose — indexes should be managed via migrations
- **Non-root Docker user** — security best practice
- **Morgan pipes to Winston** at `http` level — single logging pipeline
- **`isOperational` flag on AppError** — lets the global error handler distinguish expected errors from bugs
- **10-second forced shutdown timeout** — prevents zombie containers
- **`http-status-codes` removed from ApiResponse defaults** — used plain strings to avoid ReasonPhrases enum type conflicts with custom messages
- **`password: select: false`** — password hash never returned unless explicitly requested with `.select('+password')`
- **`AccountStatus` enum vs boolean `isActive`** — enum supports suspended state (e.g., admin action vs user self-deactivation), more flexible than a boolean
- **`passwordChangedAt` on model, tokens in Redis** — model tracks the timestamp so auth middleware can invalidate tokens; actual verification/reset tokens live in Redis with TTLs
- **`Record<string, unknown>` for Mongoose transform `ret`** — TypeScript strict mode disallows `delete` on non-optional typed properties, so we type the plain object as a record
- **Compound index `{ role, accountStatus }`** — supports future admin dashboard queries that filter by role and status together
- **Repository uses `.lean()`** — returns plain JS objects instead of Mongoose documents, faster and lower memory for read queries
- **`existsByEmail` uses `countDocuments` + `limit(1)`** — stops scanning after first match, cheaper than `findOne` when you only need a boolean
- **`findByEmailWithPassword` is a separate method** — password-inclusive queries are explicit, never accidental
- **Repository never hashes passwords** — it receives pre-hashed strings from the service layer, keeping crypto concerns out of the data layer
- **All update methods return `{ new: true }`** — callers always get the updated document without a second query
- **Login schema uses `min(1)` not the full password regex** — revealing password complexity rules on the login endpoint leaks information about the password policy
- **`validate` middleware returns 400 directly** — validation failures are expected, not exceptional, so we format them inline rather than throwing to the global error handler
- **`req.body` is replaced with parsed output** — downstream code always sees trimmed, lowercased, defaulted data without re-parsing
- **Password regex uses lookaheads, not multiple `.regex()` calls** — single regex is cleaner and gives one error message instead of four separate ones

## Commit history

```
chore: initialize production backend architecture
feat(auth): add user model
feat(auth): add user repository
feat(auth): add auth validation schemas
```
