import { Socket, Server as SocketIOServer } from 'socket.io';
import logger from '../../utils/logger';

/**
 * Register handler for socket disconnection event.
 */
export const registerDisconnectHandler = (io: SocketIOServer, socket: Socket): void => {
  socket.on('disconnect', (reason: string) => {
    const connectionCount = io.sockets.sockets.size;
    const user = socket.data.user;

    logger.info('[Socket.IO] Client disconnected', {
      socketId: socket.id,
      userId: user?.id,
      reason,
      connectionCount,
    });
  });
};
