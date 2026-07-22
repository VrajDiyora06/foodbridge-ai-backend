import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { env, swaggerSpec } from './config';
import {
  helmetMiddleware,
  corsMiddleware,
  compressionMiddleware,
  morganMiddleware,
  rateLimiter,
  requestId,
  requestLogger,
  globalErrorHandler,
} from './middlewares';
import routes from './routes';
import { ApiResponse } from './utils';

const app = express();

// ── Security & performance ──────────────────────────────
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(compressionMiddleware);

// ── Body parsing ────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Observability ───────────────────────────────────────
app.use(requestId);
app.use(requestLogger);
app.use(morganMiddleware);

// ── Rate limiting ───────────────────────────────────────
app.use(rateLimiter);

// ── API docs ────────────────────────────────────────────
app.use(`${env.apiPrefix}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Routes ──────────────────────────────────────────────
app.use(env.apiPrefix, routes);

// ── 404 catch-all ───────────────────────────────────────
app.use((_req, res) => {
  ApiResponse.notFound(res, 'Route not found');
});

// ── Global error handler (must be last) ─────────────────
app.use(globalErrorHandler);

export default app;
