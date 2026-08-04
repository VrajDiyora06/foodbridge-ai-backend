export const createMockRedis = () => {
  const store = new Map<string, string>();

  return {
    get: jest.fn(async (key: string) => store.get(key) || null),
    set: jest.fn(async (key: string, value: string) => store.set(key, value)),
    del: jest.fn(async (key: string) => {
      store.delete(key);
      return 1;
    }),
    exists: jest.fn(async (key: string) => (store.has(key) ? 1 : 0)),
    expire: jest.fn(async () => 1),
    flushall: jest.fn(async () => {
      store.clear();
      return 'OK';
    }),
  };
};
