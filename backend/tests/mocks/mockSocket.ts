export const createMockSocket = () => {
  const events = new Map<string, Array<(...args: any[]) => void>>();

  return {
    on: jest.fn((event: string, callback: (...args: any[]) => void) => {
      if (!events.has(event)) events.set(event, []);
      events.get(event)!.push(callback);
    }),
    emit: jest.fn((event: string, ...args: any[]) => {
      const callbacks = events.get(event) || [];
      callbacks.forEach((cb) => cb(...args));
    }),
    to: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    disconnect: jest.fn(),
  };
};
