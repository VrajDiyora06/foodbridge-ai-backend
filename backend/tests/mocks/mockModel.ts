/**
 * Creates a mock Mongoose model with chainable query methods.
 * Usage: const MockModel = createMockModel();
 */
export const createMockModel = () => {
  const chainable = {
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(null),
  };

  return {
    create: jest.fn(),
    findById: jest.fn().mockReturnValue(chainable),
    findOne: jest.fn().mockReturnValue(chainable),
    find: jest.fn().mockReturnValue(chainable),
    findByIdAndUpdate: jest.fn().mockReturnValue(chainable),
    findByIdAndDelete: jest.fn().mockReturnValue(chainable),
    countDocuments: jest.fn().mockResolvedValue(0),
    aggregate: jest.fn().mockResolvedValue([]),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
    ...chainable,
  };
};
