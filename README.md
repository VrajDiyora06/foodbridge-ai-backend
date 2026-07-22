# FoodBridge AI

Backend API for intelligent food redistribution. Built with Node.js, Express, TypeScript, MongoDB, Redis, and BullMQ.

## Quick start

```bash
# 1. Clone and install
git clone <repo-url>
cd foodbridge-ai
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your values

# 3. Start infrastructure
docker compose up -d mongo redis

# 4. Run in development
npm run dev
```

The API starts at `http://localhost:5000/api/v1`.
Swagger docs at `http://localhost:5000/api/v1/docs`.

## Running with Docker (full stack)

```bash
docker compose up -d
```

This starts the API, MongoDB, and Redis together.

## Scripts

| Command              | What it does                        |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Start dev server with hot reload    |
| `npm run build`      | Compile TypeScript to `dist/`       |
| `npm start`          | Run compiled production build       |
| `npm run lint`       | Check for lint errors               |
| `npm run lint:fix`   | Auto-fix lint errors                |
| `npm run format`     | Format code with Prettier           |
| `npm test`           | Run test suite                      |
| `npm run test:watch` | Run tests in watch mode             |
| `npm run docker:up`  | Start all services via Docker       |
| `npm run docker:down`| Stop all Docker services            |

## Project structure

```
src/
├── config/          # Environment, Swagger, and app-wide settings
├── controllers/     # HTTP layer — parse request, call service, send response
├── database/        # MongoDB and Redis connection modules
├── events/          # Socket.IO event handlers (real-time)
├── jobs/            # BullMQ background job processors
├── middlewares/     # Express middleware (auth, error, security)
├── models/          # Mongoose schemas and model definitions
├── repositories/    # Data access layer — all MongoDB queries
├── routes/          # Express route definitions
├── services/        # Business logic layer
├── types/           # Shared TypeScript interfaces and types
├── utils/           # Logger, API response wrapper, error classes
├── validations/     # Zod schemas for request validation
├── app.ts           # Express app assembly
└── server.ts        # Entry point — connects DBs and starts listening
```

## Architecture

Clean layered architecture:

```
Routes → Controllers → Services → Repositories → Database
```

- **Controllers** parse HTTP, delegate to services, and format responses. No business logic.
- **Services** contain all business logic and orchestrate between repositories.
- **Repositories** are the only layer that touches MongoDB directly.

## Health check

```
GET /api/v1/health
```

Returns the status of MongoDB and Redis with latency measurements.

## Environment variables

See [`.env.example`](.env.example) for all available variables and their defaults.

## License

MIT
