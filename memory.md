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
- Exports `AuthController` class and singleton `authController` instance

### Phase 2 — Authentication: Auth middleware & routes (completed)

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

### Phase 2 — Authentication: Swagger documentation (completed)

**src/routes/**
- `auth.routes.ts` — added full OpenAPI 3.0 JSDoc annotations for all 8 authentication endpoints and 9 component schemas

Documented schemas:
- `RegisterRequest`, `LoginRequest`, `VerifyEmailRequest`, `RefreshTokenRequest`, `ForgotPasswordRequest`, `ResetPasswordRequest`, `UserResponse`, `AuthResponse`, `ErrorResponse`

### Phase 3 — Food Redistribution: Food listing model (completed)

**src/models/**
- `food.model.ts` — Mongoose schema for food listings created by donors

Enums:
- `FoodCategory`: cooked, raw, packaged, bakery, dairy, beverages, fruits, vegetables, grains, snacks, other
- `FoodStatus`: available, reserved, picked_up, delivered, expired, cancelled

Interfaces:
- `ICoordinates` — `{ latitude: number, longitude: number }`
- `ILocation` — `{ address, city, state, postalCode, country, coordinates }`
- `IFood` — plain data shape
- `IFoodDocument` — extends IFood + Document, includes virtuals and instance methods

Virtuals:
- `isExpired` — boolean getter (`new Date() > expiresAt`)

Instance Methods:
- `canBeReserved()` — returns `status === FoodStatus.AVAILABLE && !isExpired`

Indexes:
- Single field: `donor`, `status`, `category`, `expiresAt`
- Geospatial: `location.coordinates` (2dsphere index for location-based search)
- Compound: `{ status: 1, expiresAt: 1 }` (for active/available non-expired listings)

### Phase 3 — Food Redistribution: Food repository (completed)

**src/repositories/**
- `food.repository.ts` — data access layer for `Food` collection

Methods:
- `create(data)` — insert a new food listing
- `findById(id)` — lookup by ObjectId using `.lean()`
- `findByIdWithDonor(id)` — lookup by ObjectId with `.populate('donor', 'name email role accountStatus')`
- `findAvailableById(id)` — lookup by ID matching `status: AVAILABLE` and `expiresAt > now`
- `findAll(filters, pagination)` — search/list with filters (`status`, `category`, `city`, `donor`, `vegetarian`, `vegan`, `expiresAfter`, `expiresBefore`) and pagination (`page`, `limit`, `sortBy`, `sortOrder`, `skip`)
- `findNearby(lat, lng, radiusKm, pagination)` — geospatial `$near` query over 2dsphere `location.coordinates` returning available, non-expired listings
- `findByDonor(donorId, pagination)` — helper delegating to `findAll({ donor: donorId })`
- `update(id, data)` — partial field update returning updated document (`{ new: true }`)
- `updateStatus(id, status)` — update listing status returning updated document
- `delete(id)` — find and delete listing, returns boolean
- `countByStatus(status)` — returns document count for a given status
- `countByDonor(donorId)` — returns document count for a given donor ID

Interfaces exported:
- `CreateFoodData`, `UpdateFoodData`, `FoodFilters`, `PaginationOptions`, `PaginatedResult<T>`

### Phase 3 — Food Redistribution: Food validation schemas (completed)

**src/validations/**
- `food.validation.ts` — four Zod schemas for food endpoints (`createFoodSchema`, `updateFoodSchema`, `foodQuerySchema`, `updateFoodStatusSchema`)

Reusable helper schemas:
- `coordinatesSchema` — latitude [-90, 90], longitude [-180, 180]
- `locationSchema` — address, city, state, postalCode, country, coordinates

Cross-field validation rules via `.superRefine`:
- `expiresAt` > `preparedAt`
- `pickupEndTime` > `pickupStartTime`
- `allergens` array required when `containsAllergens === true`

Exported DTO types:
- `CreateFoodDto`, `UpdateFoodDto`, `FoodQueryDto`, `UpdateFoodStatusDto`

### Phase 3 — Food Redistribution: Food service (completed)

**src/services/**
- `food.service.ts` — food donation business logic (`FoodService` class & exported singleton `foodService`)

Methods implemented:
- `createFood(donorId, dto)` — verify donor exists, active, and verified; save food listing
- `getFoodById(foodId)` — retrieve listing with populated donor details, throw 404 if missing
- `getAvailableFood(query)` — filter and paginate available listings; delegates to `findNearby` if coords provided
- `getNearbyFood(lat, lng, radiusKm, pagination)` — geospatial proximity search delegation
- `getDonorFood(donorId, pagination)` — retrieve all listings for a specific donor
- `updateFood(foodId, donorId, dto)` — ownership validation; prevents updating delivered/cancelled listings
- `updateFoodStatus(foodId, donorId, status)` — status transition enforcement (`AVAILABLE` → `RESERVED`/`PICKED_UP`/`DELIVERED`/`CANCELLED`; `RESERVED` → `PICKED_UP`/`DELIVERED`/`CANCELLED`; `PICKED_UP` → `DELIVERED`/`CANCELLED`; `EXPIRED`/`DELIVERED`/`CANCELLED` → terminal)
- `deleteFood(foodId, donorId)` — ownership check; prevents deletion of delivered listings
- `getFoodStatistics(donorId?)` — aggregate statistics using `Promise.all` concurrent execution

Exported interfaces & singleton:
- `FoodStatistics`, `foodService`

### Phase 3 — Food Redistribution: Food controller (completed)

**src/controllers/**
- `food.controller.ts` — thin HTTP request handlers delegating to `FoodService` and returning uniform `ApiResponse` envelopes

Controller methods:
- `createFood` — POST /api/v1/food (201 Created)
- `getFoodById` — GET /api/v1/food/:id (200 OK)
- `getAvailableFood` — GET /api/v1/food (200 OK paginated)
- `getNearbyFood` — GET /api/v1/food/nearby (200 OK paginated)
- `getMyFood` — GET /api/v1/food/my (200 OK paginated)
- `updateFood` — PATCH /api/v1/food/:id (200 OK)
- `updateFoodStatus` — PATCH /api/v1/food/:id/status (200 OK)
- `deleteFood` — DELETE /api/v1/food/:id (200 OK message)
- `getFoodStatistics` — GET /api/v1/food/my/statistics (200 OK)

Exported class & singleton:
- `FoodController`, `foodController`

### Phase 3 — Food Redistribution: Food routes (completed)

**src/routes/**
- `food.routes.ts` — Express router mapping 9 food endpoints to validation schemas, auth/RBAC middlewares, and `foodController`
- Mounted in `src/routes/index.ts` under `/food` (effective URL path `/api/v1/food`)

Endpoints mounted:
- `GET /api/v1/food` → `validate(foodQuerySchema)` → `foodController.getAvailableFood`
- `GET /api/v1/food/nearby` → `validate(foodQuerySchema)` → `foodController.getNearbyFood`
- `GET /api/v1/food/my` → `authenticate` → `authorize(DONOR, ADMIN)` → `validate(foodQuerySchema)` → `foodController.getMyFood`
- `GET /api/v1/food/my/statistics` → `authenticate` → `authorize(DONOR, ADMIN)` → `foodController.getFoodStatistics`
- `GET /api/v1/food/:id` → `foodController.getFoodById`
- `POST /api/v1/food` → `authenticate` → `authorize(DONOR, ADMIN)` → `validate(createFoodSchema)` → `foodController.createFood`
- `PATCH /api/v1/food/:id` → `authenticate` → `authorize(DONOR, ADMIN)` → `validate(updateFoodSchema)` → `foodController.updateFood`
- `PATCH /api/v1/food/:id/status` → `authenticate` → `authorize(DONOR, ADMIN)` → `validate(updateFoodStatusSchema)` → `foodController.updateFoodStatus`
- `DELETE /api/v1/food/:id` → `authenticate` → `authorize(DONOR, ADMIN)` → `foodController.deleteFood`

### Phase 3 — Food Redistribution: Swagger documentation (completed)

**src/routes/**
- `food.routes.ts` — annotated with OpenAPI 3.0 JSDoc specifications for all 9 food listing endpoints and 10 component schemas (`Food`, `Location`, `Coordinates`, `CreateFoodRequest`, `UpdateFoodRequest`, `UpdateFoodStatusRequest`, `FoodStatistics`, `PaginatedFoodResponse`, `FoodResponse`, `ErrorResponse`).

Endpoints documented:
- `GET /api/v1/food` (200 OK paginated, query parameter filtering)
- `GET /api/v1/food/nearby` (200 OK paginated, latitude/longitude proximity search)
- `GET /api/v1/food/my` (200 OK paginated, Bearer authentication required)
- `GET /api/v1/food/my/statistics` (200 OK statistics envelope, Bearer authentication required)
- `GET /api/v1/food/:id` (200 OK details / 404 Not Found)
- `POST /api/v1/food` (201 Created / 400 Validation / 401 Unauthorized / 403 Forbidden)
- `PATCH /api/v1/food/:id` (200 OK / 400 Invalid / 401 Unauthorized / 403 Forbidden / 404 Not Found)
- `PATCH /api/v1/food/:id/status` (200 OK / 400 Invalid state transition / 401 Unauthorized / 403 Forbidden / 404 Not Found)
- `DELETE /api/v1/food/:id` (200 OK message / 401 Unauthorized / 403 Forbidden / 404 Not Found)

### Phase 4 — Reservation Module: Reservation model (completed)

**src/models/**
- `reservation.model.ts` — Mongoose schema, model, virtuals, instance methods, and indexes for food reservation claims
- `index.ts` — Barrel exports for models (`User`, `Food`, `Reservation`) and their types/enums

Enums exported:
- `ReservationStatus` (`pending`, `accepted`, `rejected`, `cancelled`, `picked_up`, `completed`, `expired`)
- `ClaimerRole` (`ngo`, `volunteer`)

Virtuals & Instance Methods:
- `isActive` virtual — returns `true` for `pending`, `accepted`, `picked_up`
- `canCancel()` method — returns `true` for `pending`, `accepted`

Indexes created:
- `{ food: 1 }`
- `{ status: 1 }`
- `{ claimer: 1 }`
- Compound `{ food: 1, status: 1 }`
- Compound `{ claimer: 1, status: 1 }`

### Phase 4 — Reservation Module: Reservation repository (completed)

**src/repositories/**
- `reservation.repository.ts` — 12 data access methods for Reservation model (`ReservationRepository` class & exported singleton `reservationRepository`)
- `index.ts` — Barrel exports for repositories (`UserRepository`, `FoodRepository`, `ReservationRepository`, `reservationRepository`)

Methods implemented:
- `create(data)` — insert new reservation claim
- `findById(id)` — find reservation using `.lean()`
- `findByIdWithRelations(id)` — find reservation populated with `food` and `claimer` details
- `findActiveByFood(foodId)` — find reservation where `food` matches and `status` IN `[pending, accepted, picked_up]`
- `findByClaimer(claimerId, pagination, filters)` — paginated list of claimer's reservations populated with `food` details
- `findByFood(foodId)` — list of all reservations for a specific food item populated with `claimer` details
- `update(id, data)` — update reservation fields
- `updateStatus(id, status)` — update reservation status
- `delete(id)` — delete reservation document
- `countByStatus(status)` — count total reservations by status
- `countByClaimer(claimerId)` — count total reservations by claimer
- `countByFood(foodId)` — count total reservations for a food listing

Interfaces exported:
- `CreateReservationData`, `UpdateReservationData`, `ReservationFilters`, `PaginationOptions`, `PaginatedResult<T>`

### Phase 4 — Reservation Module: Reservation validation schemas (completed)

**src/validations/**
- `reservation.validation.ts` — four Zod schemas for reservation endpoints (`createReservationSchema`, `updateReservationStatusSchema`, `reservationQuerySchema`, `cancelReservationSchema`)
- `index.ts` — Barrel exports for all validation schemas (`auth`, `food`, `reservation`)

Reusable helper schemas:
- `objectIdSchema` — validates 24-character Mongo ObjectId regex (`/^[0-9a-fA-F]{24}$/`)
- `paginationSchema` — page (>=1, default 1), limit (1-100, default 10)
- `sortSchema` — sortBy (`createdAt`, `updatedAt`, `pickupTime`), sortOrder (`asc`, `desc`, default `desc`)

Exported DTO types:
- `CreateReservationDto`, `UpdateReservationStatusDto`, `ReservationQueryDto`, `CancelReservationDto`

### Phase 4 — Reservation Module: Reservation service (completed)

**src/services/**
- `reservation.service.ts` — food reservation business logic (`ReservationService` class & exported singleton `reservationService`)
- `index.ts` — Barrel exports for services (`HealthService`, `AuthService`, `TokenService`, `FoodService`, `ReservationService`)

Methods implemented:
- `createReservation(userId, dto)` — validates user (active, verified, NGO/Volunteer role), verifies food (available, unexpired, no active claim), creates reservation claim, sets food status to `RESERVED`
- `getReservationById(id)` — retrieves reservation populated with `food` and `claimer` details, throws 404 if missing
- `getMyReservations(userId, query)` — paginated list of reservations claimed by user
- `acceptReservation(reservationId, donorId)` — donor owner accepts pending claim (`pending` → `accepted`, food stays `RESERVED`)
- `rejectReservation(reservationId, donorId)` — donor owner rejects pending claim (`pending` → `rejected`, food returns to `AVAILABLE`)
- `cancelReservation(reservationId, userId, dto)` — claimer owner cancels pending/accepted claim (`pending`/`accepted` → `cancelled`, food returns to `AVAILABLE`)
- `markPickedUp(reservationId, donorId)` — donor owner marks accepted claim as picked up (`accepted` → `picked_up`, food status `PICKED_UP`)
- `completeReservation(reservationId, donorId)` — donor owner marks picked up claim as completed (`picked_up` → `completed`, food status `DELIVERED`)
- `getReservationStatistics(userId)` — aggregate counts (`total`, `pending`, `accepted`, `completed`, `cancelled`) using `Promise.all`

Exported interfaces & singleton:
- `ReservationStatistics`, `reservationService`

### Phase 4 — Reservation Module: Reservation controller (completed)

**src/controllers/**
- `reservation.controller.ts` — thin HTTP request handlers delegating to `ReservationService` and returning uniform `ApiResponse` envelopes
- `index.ts` — Barrel exports for controllers (`getHealth`, `AuthController`, `authController`, `FoodController`, `foodController`, `ReservationController`, `reservationController`)

Controller methods:
- `createReservation` — POST /api/v1/reservations (201 Created)
- `getReservationById` — GET /api/v1/reservations/:id (200 OK)
- `getMyReservations` — GET /api/v1/reservations/my (200 OK paginated)
- `acceptReservation` — PATCH /api/v1/reservations/:id/accept (200 OK)
- `rejectReservation` — PATCH /api/v1/reservations/:id/reject (200 OK)
- `cancelReservation` — PATCH /api/v1/reservations/:id/cancel (200 OK)
- `markPickedUp` — PATCH /api/v1/reservations/:id/pickup (200 OK)
- `completeReservation` — PATCH /api/v1/reservations/:id/complete (200 OK)
- `getReservationStatistics` — GET /api/v1/reservations/my/statistics (200 OK)

Exported class & singleton:
- `ReservationController`, `reservationController`

### Phase 4 — Reservation Module: Reservation routes (completed)

**src/routes/**
- `reservation.routes.ts` — Express router mapping 9 reservation endpoints to validation schemas, auth/RBAC middlewares, and `reservationController`
- Mounted in `src/routes/index.ts` under `/reservations` (effective URL path `/api/v1/reservations`)

Endpoints mounted:
- `GET /api/v1/reservations/my` → `authenticate` → `authorize(NGO, VOLUNTEER)` → `validate(reservationQuerySchema)` → `reservationController.getMyReservations`
- `GET /api/v1/reservations/my/statistics` → `authenticate` → `authorize(NGO, VOLUNTEER)` → `reservationController.getReservationStatistics`
- `GET /api/v1/reservations/:id` → `authenticate` → `authorize(NGO, VOLUNTEER, DONOR, ADMIN)` → `reservationController.getReservationById`
- `POST /api/v1/reservations` → `authenticate` → `authorize(NGO, VOLUNTEER)` → `validate(createReservationSchema)` → `reservationController.createReservation`
- `PATCH /api/v1/reservations/:id/accept` → `authenticate` → `authorize(DONOR, ADMIN)` → `validate(updateReservationStatusSchema)` → `reservationController.acceptReservation`
- `PATCH /api/v1/reservations/:id/reject` → `authenticate` → `authorize(DONOR, ADMIN)` → `validate(updateReservationStatusSchema)` → `reservationController.rejectReservation`
- `PATCH /api/v1/reservations/:id/cancel` → `authenticate` → `authorize(NGO, VOLUNTEER)` → `validate(cancelReservationSchema)` → `reservationController.cancelReservation`
- `PATCH /api/v1/reservations/:id/pickup` → `authenticate` → `authorize(DONOR, ADMIN)` → `validate(updateReservationStatusSchema)` → `reservationController.markPickedUp`
- `PATCH /api/v1/reservations/:id/complete` → `authenticate` → `authorize(DONOR, ADMIN)` → `validate(updateReservationStatusSchema)` → `reservationController.completeReservation`

### Phase 4 — Reservation Module: Swagger documentation (completed)

**src/routes/**
- `reservation.routes.ts` — annotated with OpenAPI 3.0 JSDoc specifications for all 9 reservation endpoints and 8 component schemas (`Reservation`, `ReservationStatistics`, `CreateReservationRequest`, `CancelReservationRequest`, `ReservationResponse`, `PaginatedReservationResponse`, `ReservationStatusUpdateResponse`, `ErrorResponse`).

Endpoints documented:
- `GET /api/v1/reservations/my` (200 OK paginated, query filtering by status and claimerRole, Bearer auth)
- `GET /api/v1/reservations/my/statistics` (200 OK statistics envelope, Bearer auth)
- `GET /api/v1/reservations/{id}` (200 OK details / 401 / 403 / 404 Not Found, Bearer auth)
- `POST /api/v1/reservations` (201 Created / 400 Bad Request / 401 / 403 / 404, Bearer auth)
- `PATCH /api/v1/reservations/{id}/accept` (200 OK / 400 / 401 / 403 / 404, Bearer auth)
- `PATCH /api/v1/reservations/{id}/reject` (200 OK / 400 / 401 / 403 / 404, Bearer auth)
- `PATCH /api/v1/reservations/{id}/cancel` (200 OK / 400 / 401 / 403 / 404, Bearer auth)
- `PATCH /api/v1/reservations/{id}/pickup` (200 OK / 400 / 401 / 403 / 404, Bearer auth)
- `PATCH /api/v1/reservations/{id}/complete` (200 OK / 400 / 401 / 403 / 404, Bearer auth)

### Phase 5 — Security & Infrastructure: Auth-specific rate limiting (completed)

**src/middlewares/**
- `authRateLimit.middleware.ts` — created `authLimiter` (10 req / 15 min), `loginLimiter` (5 req / 15 min), and `passwordResetLimiter` (3 req / 1 hour) using `express-rate-limit`
- `index.ts` — re-exported rate limiters

**src/routes/**
- `auth.routes.ts` — attached `authLimiter` to `/register`, `/verify-email`, `/refresh-token`; `loginLimiter` to `/login`; `passwordResetLimiter` to `/forgot-password`, `/reset-password`

**src/config/ & root**
- `env.config.ts` — added `authRateLimitWindowMs`, `authRateLimitMax`, `loginRateLimitMax`, `passwordResetRateLimitMax`
- `.env.example` — added auth rate limit environment variable defaults

### Phase 5 — Security & Infrastructure: BullMQ Queue Infrastructure (completed)

**src/jobs/**
- `queueNames.ts` — constants for `FOOD_EXPIRY_QUEUE` (`'food-expiry-queue'`), `RESERVATION_EXPIRY_QUEUE` (`'reservation-expiry-queue'`), and `EMAIL_QUEUE` (`'email-queue'`)
- `queue.ts` — BullMQ `Queue` & `QueueEvents` singletons, Winston event listeners (`completed`, `failed`, `stalled`), helper enqueue functions (`addFoodExpiryJob`, `addReservationExpiryJob`, `addEmailJob`), and lifecycle functions (`initQueues`, `closeQueues`)
- `index.ts` — barrel exports for queue names, queue singletons, helpers, and lifecycle functions

**src/server.ts**
- Startup: calls `initQueues()` after Redis is connected
- Graceful shutdown: calls `await closeQueues()` before disconnecting Redis and MongoDB

### Phase 5 — Security & Infrastructure: Food Expiry Worker (completed)

**src/jobs/**
- `foodExpiry.worker.ts` — BullMQ worker consuming `FOOD_EXPIRY_QUEUE`. Loads food listing via `FoodRepository`, handles missing/terminal states safely (`EXPIRED`, `DELIVERED`, `CANCELLED`), updates active expired items to `FoodStatus.EXPIRED`, logs events with Winston, rethrows errors for BullMQ retries
- `index.ts` — re-exported `foodExpiryWorker`, `initFoodExpiryWorker`, `closeFoodExpiryWorker`, `processFoodExpiryJob`, `FoodExpiryJobData`

**src/server.ts**
- Startup: calls `initFoodExpiryWorker()`
- Graceful shutdown: calls `await closeFoodExpiryWorker()`

### Phase 5 — Security & Infrastructure: Reservation Expiry Worker (completed)

**src/jobs/**
- `reservationExpiry.worker.ts` — BullMQ worker consuming `RESERVATION_EXPIRY_QUEUE`. Loads reservation via `reservationRepository`, handles missing or terminal states (`REJECTED`, `CANCELLED`, `COMPLETED`, `EXPIRED`), updates `PENDING` expired reservations to `ReservationStatus.EXPIRED`, and reverts linked food status to `FoodStatus.AVAILABLE` if currently `RESERVED`
- `index.ts` — re-exported `reservationExpiryWorker`, `initReservationExpiryWorker`, `closeReservationExpiryWorker`, `processReservationExpiryJob`, `ReservationExpiryJobData`

**src/server.ts**
- Startup: calls `initReservationExpiryWorker()`
- Graceful shutdown: calls `await closeReservationExpiryWorker()`

### Phase 5 — Security & Infrastructure: Email Worker (completed)

**src/jobs/**
- `email.worker.ts` — BullMQ worker consuming `EMAIL_QUEUE`. Validates payload fields (`to`, `subject`, `template`), logs simulated email dispatch metadata (`jobId`, `recipient`, `subject`, `template`, `status`) via Winston without third-party email SDKs (Nodemailer/SendGrid), configured with 5 retries and exponential backoff
- `index.ts` — re-exported `emailWorker`, `initEmailWorker`, `closeEmailWorker`, `processEmailJob`, `EmailJobData`

**src/server.ts**
- Startup: calls `initEmailWorker()`
- Graceful shutdown: calls `await closeEmailWorker()`

### Phase 5 — Security & Infrastructure: SMTP Email Delivery (completed)

**src/services/**
- `email.service.ts` — Nodemailer SMTP transporter singleton `EmailService` configured via environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_NAME`, `SMTP_FROM_EMAIL`). Provides HTML/text email template renderer supporting `verify-email` and `password-reset` templates.
- `index.ts` — re-exported `EmailService`, `emailService`, `SendEmailOptions`, `RenderedTemplate`

**src/jobs/**
- `email.worker.ts` — connected worker job processor function (`processEmailJob`) to `emailService.renderTemplate` and `emailService.sendEmail`. Validates payloads (no retries on malformed payloads) and rethrows SMTP delivery errors so BullMQ handles automated retries

**Config**
- `env.config.ts` & `.env.example` — added `smtpHost`, `smtpPort`, `smtpUser`, `smtpPassword`, `smtpFromName`, `smtpFromEmail`

### Phase 5 — Security & Infrastructure: Socket.IO Infrastructure (completed)

**src/socket/**
- `socketManager.ts` — `SocketManager` singleton supporting `initialize(server)`, `getIO()`, and graceful async `close()`. Configured with CORS matching `env.corsOrigin` and ping parameters
- `events/connection.event.ts` — handles client connection events, tracks connection counts, logs socket IDs via Winston, and registers disconnect handlers
- `events/disconnect.event.ts` — handles client disconnection events, logs socket ID and disconnect reason via Winston
- `socket.ts` — re-exported `socketManager`, `SocketManager`, `handleConnection`, `registerDisconnectHandler`

**src/server.ts**
- Startup: calls `socketManager.initialize(server)` after HTTP server launch
- Graceful shutdown: calls `await socketManager.close()` during graceful shutdown sequence


## What has NOT been built yet

- Real-time event emitters (food updates, reservation updates, notifications)
- Socket JWT Authentication Middleware
- GitHub Actions CI/CD pipeline
- Integration/e2e tests

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
- **Swagger schemas embedded in auth routes** — keeps route definitions and OpenAPI schemas co-located for easy maintenance
- **Geospatial 2dsphere index on `location.coordinates`** — enables proximity queries (finding nearby available food donations)
- **`isExpired` virtual & `canBeReserved()` instance method** — encapsulates state logic directly on the model
- **`FoodRepository.findNearby` uses `$near` + `$geometry`** — performs geospatial search within a given kilometer radius converting to meters (`radiusKm * 1000`)
- **Parallel `find` & `countDocuments` queries** — `findAll` and `findNearby` run data fetching and total count concurrently using `Promise.all` for optimal response time
- **`.superRefine` for cross-field food validations** — validates date ordering (`expiresAt > preparedAt`, `pickupEndTime > pickupStartTime`) and conditional allergen requirement (`containsAllergens == true`)
- **Strict food status transition state machine** — enforces terminal states (`EXPIRED`, `DELIVERED`, `CANCELLED`) and allowed forward transitions
- **Ownership verification in food service** — safely extracts donor ID whether `food.donor` is populated as an object or stored as an ObjectId
- **ApiResponse.paginated used for all paginated listing endpoints** — formats data array and metadata (`page`, `limit`, `total`, `totalPages`) consistently
- **Static route paths before parameterized `/:id` route in Express router** — `/nearby`, `/my`, `/my/statistics` defined before `/:id` so Express doesn't match string literals as ID parameters
- **Co-located Swagger annotations on food routes** — keeping OpenAPI docs right above route handlers ensures docs stay synchronized with endpoints
- **Reservation `isActive` virtual & `canCancel()` method** — encapsulates reservation lifecycle validation on the document model
- **`findActiveByFood` in ReservationRepository** — queries `status: { $in: ['pending', 'accepted', 'picked_up'] }` to ensure single active claim per food item
- **Regex-based Mongo ObjectId Zod validator (`objectIdSchema`)** — verifies 24-hex-char MongoDB string ID format across reservation inputs
- **Strict Reservation State Machine** — `PENDING` → `ACCEPTED`/`REJECTED`/`CANCELLED`; `ACCEPTED` → `PICKED_UP`/`CANCELLED`; `PICKED_UP` → `COMPLETED`
- **Automatic Food Status Sync** — accepting/creating reservation updates food to `RESERVED`, rejecting/cancelling returns food to `AVAILABLE`, picking up sets `PICKED_UP`, completing sets `DELIVERED`
- **Clean separation of Donor actions vs Claimer actions** — `accept`, `reject`, `pickup`, `complete` handled by food donor owner; `cancel` handled by claimer owner
- **Strict route ordering in reservation router** — static `/my` and `/my/statistics` mounted before `/:id` to prevent route matching collisions
- **Co-located Swagger annotations on reservation routes** — keeping OpenAPI docs right above route handlers ensures docs stay synchronized with endpoints
- **Tiered route-specific rate limiters for auth** — 5 req/15min for `/login` (brute-force defense), 3 req/hour for password reset (abuse defense), 10 req/15min for general auth (`/register`, `/verify-email`, `/refresh-token`)
- **BullMQ Singleton & Lifecycle Pattern** — shared `ioredis` connection instance with `maxRetriesPerRequest: null`, `QueueEvents` listeners logging via Winston, graceful async `closeQueues()` on SIGINT/SIGTERM
- **Idempotent Food Expiry Worker** — skips missing or already-terminal listings (`EXPIRED`, `DELIVERED`, `CANCELLED`), updates expired items via `FoodRepository.updateStatus`, configured with 3 retries & exponential backoff
- **Reservation Expiry & Food Sync Worker** — marks expired `PENDING` claims as `EXPIRED` via `reservationRepository` and reverts linked food status back to `AVAILABLE` via `foodRepository` if currently `RESERVED`
- **Zero-Dependency Email Worker** — validates payload, logs dispatch details cleanly via Winston logger, configured with 5 retries and exponential backoff for future SMTP pluggability
- **Non-blocking Service Queue Integration** — background job enqueue calls (`addEmailJob`, `addFoodExpiryJob`, `addReservationExpiryJob`) wrapped in `try/catch` with Winston logging, ensuring core DB transactions succeed even if Redis queue fails
- **Nodemailer SMTP Transporter & HTML Templates** — environment-driven SMTP transport with extensible template rendering for `verify-email` and `password-reset` emails
- **SocketManager Singleton Infrastructure** — non-blocking Socket.IO setup attached to Express HTTP server with Winston logging, modular connection/disconnect handlers, and graceful shutdown

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
docs(auth): add swagger documentation
feat(food): add food listing model
feat(food): add food repository
feat(food): add food validation schemas
feat(food): add food service
feat(food): add food controller
feat(food): add food routes
docs(food): add swagger documentation
feat(reservation): add reservation model
feat(reservation): add reservation repository
feat(reservation): add reservation validation
feat(reservation): add reservation service
feat(reservation): add reservation controller
feat(reservation): add reservation routes
docs(reservation): add swagger documentation
feat(auth): add route-specific rate limiting
feat(queue): add BullMQ infrastructure
feat(queue): add food expiry worker
feat(queue): add reservation expiry worker
feat(queue): add email worker
feat(queue): integrate background job scheduling
feat(email): integrate SMTP email delivery
feat(socket): add Socket.IO infrastructure
```
