// Global setup file for Jest integration environment initialization
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-1234567890';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-1234567890';
process.env.BCRYPT_SALT_ROUNDS = '10';
