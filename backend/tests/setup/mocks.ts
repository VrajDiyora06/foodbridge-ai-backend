// Mock BullMQ queue jobs
jest.mock('../../src/jobs', () => ({
  initQueues: jest.fn().mockResolvedValue(undefined),
  closeQueues: jest.fn().mockResolvedValue(undefined),
  addFoodExpiryJob: jest.fn().mockResolvedValue(undefined),
  addReservationExpiryJob: jest.fn().mockResolvedValue(undefined),
  addEmailJob: jest.fn().mockResolvedValue(undefined),
  addNotificationJob: jest.fn().mockResolvedValue(undefined),
  initFoodExpiryWorker: jest.fn(),
  closeFoodExpiryWorker: jest.fn(),
  initReservationExpiryWorker: jest.fn(),
  closeReservationExpiryWorker: jest.fn(),
  initEmailWorker: jest.fn(),
  closeEmailWorker: jest.fn(),
}));

// Mock Nodemailer / EmailService
jest.mock('../../src/services/email.service', () => {
  return {
    EmailService: jest.fn().mockImplementation(() => ({
      sendEmail: jest.fn().mockResolvedValue({ messageId: 'mock-msg-id' }),
      renderTemplate: jest.fn().mockReturnValue({ html: '<p>Mock</p>', text: 'Mock' }),
    })),
    emailService: {
      sendEmail: jest.fn().mockResolvedValue({ messageId: 'mock-msg-id' }),
      renderTemplate: jest.fn().mockReturnValue({ html: '<p>Mock</p>', text: 'Mock' }),
    },
  };
});

// Mock Socket.IO Manager & Event Emitters
jest.mock('../../src/socket/socketManager', () => ({
  socketManager: {
    initialize: jest.fn(),
    getIO: jest.fn().mockReturnValue({ emit: jest.fn(), to: jest.fn().mockReturnValue({ emit: jest.fn() }) }),
    emit: jest.fn(),
    broadcast: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../src/socket/events/food.events', () => ({
  emitFoodCreated: jest.fn(),
  emitFoodUpdated: jest.fn(),
  emitFoodDeleted: jest.fn(),
  emitFoodExpired: jest.fn(),
}));

jest.mock('../../src/socket/events/reservation.events', () => ({
  emitReservationCreated: jest.fn(),
  emitReservationAccepted: jest.fn(),
  emitReservationRejected: jest.fn(),
  emitReservationCancelled: jest.fn(),
  emitReservationPickedUp: jest.fn(),
  emitReservationCompleted: jest.fn(),
}));

jest.mock('../../src/socket/events/notification.events', () => ({
  emitNotificationRead: jest.fn(),
  emitNotificationDeleted: jest.fn(),
  emitNotificationBroadcast: jest.fn(),
}));

// Mock Redis client (Map-backed in-memory store)
const redisStore = new Map<string, string>();

const mockRedis = {
  set: jest.fn().mockImplementation((key: string, val: string) => {
    redisStore.set(key, val);
    return Promise.resolve('OK');
  }),
  get: jest.fn().mockImplementation((key: string) => {
    return Promise.resolve(redisStore.get(key) || null);
  }),
  del: jest.fn().mockImplementation((...keys: string[]) => {
    let count = 0;
    for (const key of keys) {
      if (redisStore.delete(key)) count++;
    }
    return Promise.resolve(count);
  }),
  exists: jest.fn().mockImplementation((key: string) => {
    return Promise.resolve(redisStore.has(key) ? 1 : 0);
  }),
  scan: jest.fn().mockImplementation((cursor: string, _match?: string, pattern?: string) => {
    const keys: string[] = [];
    if (pattern) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      for (const k of redisStore.keys()) {
        if (regex.test(k)) keys.push(k);
      }
    }
    return Promise.resolve(['0', keys]);
  }),
  clear: () => redisStore.clear(),
};

jest.mock('../../src/database/redis.connection', () => ({
  connectRedis: jest.fn().mockResolvedValue(mockRedis),
  getRedisClient: () => mockRedis,
  disconnectRedis: jest.fn().mockResolvedValue(undefined),
}));

export { mockRedis, redisStore };
