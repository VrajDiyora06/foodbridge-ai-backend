import { Socket, Server as SocketIOServer } from 'socket.io';
import logger from '../../utils/logger';
import { registerDisconnectHandler } from './disconnect.event';

/**
 * Handle new incoming Socket.IO connection event.
 */
export const handleConnection = (io: SocketIOServer, socket: Socket): void => {
  const connectionCount = io.sockets.sockets.size;
  const user = socket.data.user;

  if (user) {
    // Automatically join user-specific and role-specific rooms
    socket.join(`user:${user.id}`);
    socket.join(`role:${user.role}`);

    logger.info('[Socket.IO] Authenticated client connected', {
      socketId: socket.id,
      userId: user.id,
      role: user.role,
      rooms: Array.from(socket.rooms),
      connectionCount,
    });
  } else {
    logger.info('[Socket.IO] Anonymous client connected', {
      socketId: socket.id,
      connectionCount,
    });
  }

  // Attach disconnect listener
  registerDisconnectHandler(io, socket);
};
