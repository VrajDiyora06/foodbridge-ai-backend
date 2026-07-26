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
### Phase 2 — Authentication: Crypto utilities (completed)

**src/utils/**
- `crypto.util.ts` — four cryptographic helpers using only Node.js built-in `crypto` module
- Added to `utils/index.ts` barrel export

Functions:
- `generateRandomToken(bytes?)` — `crypto.randomBytes`, returns hex string, default 32 bytes (64 hex chars). Used for email verification and password reset tokens.
- `generateTokenId()` — `crypto.randomUUID()`, returns UUID v4. Used as JWT `jti` and refresh token identifiers.
- `generateSecureOTP(length?)` — numeric OTP via rejection sampling (eliminates modulo bias), default 6 digits, max 10. Used for future OTP verification flows.
- `timingSafeCompare(a, b)` — wraps `crypto.timingSafeEqual`, handles different-length strings without leaking timing info (compares bufA against itself then returns false). Used for token comparison.
### Phase 2 — Authentication: Token service (completed)

**src/services/**
- `token.service.ts` — centralized JWT generation/verification and Redis token lifecycle

JWT payload interfaces:
- `AccessTokenPayload` — `{ userId, role, jti }`, signed with `JWT_SECRET`, TTL 15m
- `RefreshTokenPayload` — `{ userId, tokenId }`, signed with `JWT_REFRESH_SECRET`, TTL 30d

Public methods:
- `generateAccessToken(userId, role)` — short-lived JWT with jti for blacklisting
- `verifyAccessToken(token)` — returns typed `AccessTokenPayload`
- `generateRefreshToken(userId)` — returns `{ token, tokenId }`
- `verifyRefreshToken(token)` — returns typed `RefreshTokenPayload`
- `storeRefreshToken(userId, tokenId)` — Redis SET with TTL
- `isRefreshTokenValid(userId, tokenId)` — Redis EXISTS check
- `revokeRefreshToken(userId, tokenId)` — Redis DEL (logout, rotation)
- `revokeAllUserRefreshTokens(userId)` — SCAN + DEL pattern `refresh:{userId}:*` (password reset)
- `storeVerificationToken(userId)` — generates hex token, stores in Redis with 24h TTL
- `getVerificationUser(token)` — returns userId or null
- `deleteVerificationToken(token)` — Redis DEL
- `storePasswordResetToken(userId)` — generates hex token, stores in Redis with 1h TTL
- `getPasswordResetUser(token)` — returns userId or null
- `deletePasswordResetToken(token)` — Redis DEL
- `blacklistAccessToken(jti, ttlSeconds)` — Redis SET with TTL = remaining token life
- `isAccessTokenBlacklisted(jti)` — Redis EXISTS check

Redis key patterns:
- `refresh:{userId}:{tokenId}` — active refresh tokens
- `verify-email:{token}` — email verification
- `reset-password:{token}` — password reset
- `blacklist:{jti}` — logged-out access tokens

Internal helper:
- `parseDurationToSeconds(duration)` — converts `15m`, `7d`, etc. to seconds for Redis TTLs and JWT expiresIn

**Modified files:**
- `env.config.ts` — added `jwtRefreshSecret`, `bcryptSaltRounds`, `emailVerificationTtl`, `passwordResetTtl`, `clientUrl`; changed `jwtExpiresIn` default from `7d` to `15m`
- `.env.example` — added matching env vars

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

### Phase 2 — Authentication: Auth service (completed)

**src/services/**
- `auth.service.ts` — authentication business logic orchestrating UserRepository, TokenService, and bcryptjs

Dependencies:
- `bcryptjs` + `@types/bcryptjs` (installed this milestone)
- `UserRepository` (data access)
- `TokenService` (JWT + Redis)
- `AppError` (error handling)
- `env` (config)

Public methods:
- `register(dto)` — check email uniqueness, hash password, create user, generate verification token. Returns user + verification token (dev only).
- `verifyEmail(token)` — lookup Redis token, mark user verified, delete token
- `login(dto)` — find user with password, bcrypt compare, check active + verified, generate access + refresh tokens, store refresh, fire-and-forget lastLogin update. Returns user + token pair.
- `refreshToken(refreshToken)` — verify JWT, validate Redis, rotate (delete old, issue new), check user active. Returns new token pair. Detects reuse: revokes all sessions.
- `forgotPassword(email)` — never reveals user existence, generates reset token if user exists, always returns same message
- `resetPassword(dto)` — validate reset token, hash new password, update password, revoke all refresh tokens, delete reset token
- `logout(accessPayload, refreshToken)` — blacklist access token (remaining TTL), revoke refresh token
- `getCurrentUser(userId)` — fetch user by ID, throw if not found

Response types exported:
- `AuthTokens` — `{ accessToken, refreshToken }`
- `RegisterResult` — `{ user, verificationToken? }`
- `LoginResult` — `{ user, accessToken, refreshToken }`
- `RefreshResult` — `{ accessToken, refreshToken }`

**Modified files:**
- `package.json` — added `bcryptjs` and `@types/bcryptjs`### Phase 2 — Authentication: Auth controller (completed)

**src/controllers/**
- `auth.controller.ts` — thin HTTP request handlers delegating to `AuthService` and returning uniform `ApiResponse` envelopes

Controller methods:
- `register` — POST /api/v1/auth/register (201 Created)
- `verifyEmail` — POST /api/v1/auth/verify-email (200 OK)
- `login` — POST /api/v1/auth/login (200 OK)
- `refreshToken` — POST /api/v1/auth/refresh-token (200 OK)
- `forgotPassword` — POST /api/v1/auth/forgot-password (200 OK)
- `resetPassword` — POST /api/v1/auth/reset-password (200 OK)
- `logout` — POST /api/v1/auth/logout (200 OK)
- `getCurrentUser` — GET /api/v1/auth/me (200 OK)

Key design details:
- Every async method wrapped with `asyncHandler` to forward unhandled promise rejections
- Thin layer with 0 business logic, 0 db queries, 0 direct JWT/crypto/bcrypt usage
- Exports `AuthController` class and singleton `authController` instance### Phase 2 — Authentication: Auth middleware & routes (completed)

**src/middlewares/**
- `auth.middleware.ts` — `authenticate` (verifies JWT access token + checks Redis blacklist) and `authorize` (RBAC guard for allowed roles)
- Added `authenticate` and `authorize` to `middlewares/index.ts` barrel export

**src/routes/**
- `auth.routes.ts` — Express router mapping auth endpoints to validation schemas and `authController` handlers
- Mounted in `src/routes/index.ts` under `/auth` (effective URL path `/api/v1/auth`)

Endpoints mounted:
- `POST /api/v1/auth/register` → `validate(registerSchema)` → `authController.register`
- `POST /api/v1/auth/verify-email` → `validate(verifyEmailSchema)` → `authController.verifyEmail`
- `POST /api/v1/auth/login` → `validate(loginSchema)` → `authController.login`
- `POST /api/v1/auth/refresh-token` → `validate(refreshTokenSchema)` → `authController.refreshToken`
- `POST /api/v1/auth/forgot-password` → `validate(forgotPasswordSchema)` → `authController.forgotPassword`
- `POST /api/v1/auth/reset-password` → `validate(resetPasswordSchema)` → `authController.resetPassword`
- `POST /api/v1/auth/logout` → `authenticate` → `authController.logout`
- `GET /api/v1/auth/me` → `authenticate` → `authController.getCurrentUser`


## What has NOT been built yet

- Auth rate limiting (stricter limiter on auth routes)
- Swagger OpenAPI annotations for auth endpoints
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
- **Rejection sampling for OTP generation** — `randomBytes % max` has modulo bias; rejection sampling discards values above the largest clean multiple to produce uniform distribution
- **`timingSafeCompare` handles length mismatch** — compares bufA against itself before returning false, so the function always takes constant time regardless of whether lengths match
- **Zero third-party crypto deps** — all four functions use Node.js built-in `crypto`, no `uuid` or `nanoid` packages needed
- **Separate JWT secrets for access and refresh tokens** — if the access token secret is compromised, refresh tokens remain safe
- **`expiresIn` passed as numeric seconds, not string** — `@types/jsonwebtoken` v9 uses a branded `StringValue` type from `ms`; converting to seconds avoids the branded type issue and is more explicit
- **SCAN with cursor pagination for `revokeAllUserRefreshTokens`** — never uses KEYS (blocks Redis); SCAN is non-blocking and paginates in batches of 100
- **Blacklist TTL = remaining access token life** — blacklist entries auto-expire when the token would have expired anyway, keeping Redis memory bounded
- **Verification/reset tokens are 64-char hex strings stored as Redis keys** — not JWTs, because they're single-use and need server-side revocation
- **Same error message for wrong email and wrong password on login** — prevents user enumeration via error message differentiation
- **Refresh token reuse detection** — if a token is valid JWT but absent from Redis, all user sessions are revoked as a precaution
- **`forgotPassword` always returns same message** — "If an account with that email exists..." prevents email enumeration
- **`updateLastLogin` is fire-and-forget** — doesn't block the login response; failure is logged but doesn't affect the user
- **Password reset revokes all refresh tokens** — forces re-login on all devices after a password change
- **Verification token returned in response only in development** — in production it would be emailed, not exposed in API
- **Thin controllers using class arrow properties** — `register = asyncHandler(...)` ensures `this` binding remains intact when passed as route handlers
- **Auth middleware checks Redis blacklist** — `authenticate` checks `isAccessTokenBlacklisted` so logged-out tokens are immediately invalid

## Commit history

```
chore: initialize production backend architecture
feat(auth): add user model
feat(auth): add user repository
feat(auth): add auth validation schemas
feat(auth): add crypto utilities
feat(auth): add token service
feat(auth): add auth service
feat(auth): add auth controller
feat(auth): add auth routes
```
