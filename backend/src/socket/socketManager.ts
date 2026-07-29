import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import env from '../config/env.config';
import logger from '../utils/logger';
import { handleConnection } from './events/connection.event';
import { socketAuthMiddleware } from './middlewares/socketAuth.middleware';

export class SocketManager {
  private io: SocketIOServer | null = null;

  /**
   * Initialize Socket.IO instance attached to the HTTP server.
   */
  public initialize(server: HttpServer): SocketIOServer {
    if (this.io) {
      logger.warn('[Socket.IO] SocketManager is already initialized');
      return this.io;
    }

    this.io = new SocketIOServer(server, {
      cors: {
        origin: env.corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Register JWT authentication middleware
    this.io.use(socketAuthMiddleware);

    // Register root connection listener
    this.io.on('connection', (socket) => {
      handleConnection(this.io!, socket);
    });

    logger.info('[Socket.IO] SocketManager initialized successfully');
    return this.io;
  }

  /**
   * Retrieve the active Socket.IO Server instance.
   * Throws an error if invoked before initialization.
   */
  public getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error(
        '[Socket.IO] SocketManager has not been initialized yet. Call initialize(server) first.',
      );
    }
    return this.io;
  }

  /**
   * Broadcast an event and payload to all connected socket clients.
   * Safe to invoke even if Socket.IO is not initialized (logs warning instead of throwing).
   */
  public emit(eventName: string, payload: unknown): void {
    try {
      if (!this.io) {
        logger.warn(`[Socket.IO] Cannot emit event '${eventName}' — SocketManager is not initialized`);
        return;
      }
      this.io.emit(eventName, payload);
      logger.debug(`[Socket.IO] Emitted event '${eventName}'`, { eventName });
    } catch (error) {
      const err = error as Error;
      logger.error(`[Socket.IO] Failed to emit event '${eventName}': ${err.message}`, {
        eventName,
        error: err.message,
      });
    }
  }

  /**
   * Alias for emit — broadcasts event to all connected clients.
   */
  public broadcast(eventName: string, payload: unknown): void {
    this.emit(eventName, payload);
  }

  /**
   * Gracefully close all socket connections and the Socket.IO server.
   */
  public async close(): Promise<void> {
    if (this.io) {
      logger.info('[Socket.IO] Closing Socket.IO server and disconnecting clients...');
      await new Promise<void>((resolve) => {
        this.io!.close(() => {
          logger.info('[Socket.IO] Socket.IO server closed successfully');
          resolve();
        });
      });
      this.io = null;
    }
  }
}

export const socketManager = new SocketManager();
