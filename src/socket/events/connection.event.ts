import { Socket, Server as SocketIOServer } from 'socket.io';
import logger from '../../utils/logger';
import { registerDisconnectHandler } from './disconnect.event';

/**
 * Handle new incoming Socket.IO connection event.
 */
export const handleConnection = (io: SocketIOServer, socket: Socket): void => {
  const connectionCount = io.sockets.sockets.size;

  logger.info('[Socket.IO] Client connected', {
    socketId: socket.id,
    connectionCount,
  });

  // Attach disconnect listener
  registerDisconnectHandler(io, socket);
};
