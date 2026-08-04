import { authenticate, authorize } from '../../src/middlewares/auth.middleware';
import { TokenService } from '../../src/services/token.service';
import { UserRole } from '../../src/models/user.model';

describe('Authentication Middleware', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.restoreAllMocks();
  });

  it('should return 401 if Authorization header is missing', async () => {
    try {
      await authenticate(req, res, next);
    } catch (err: any) {
      expect(err.statusCode).toBe(401);
    }
  });

  it('should attach user payload to req when token is valid', async () => {
    req.headers.authorization = 'Bearer valid-jwt-token';
    const mockPayload = { userId: 'user-123', email: 'test@example.com', role: 'donor', jti: 'jti-1' };

    jest.spyOn(TokenService.prototype, 'verifyAccessToken').mockReturnValue(mockPayload as any);
    jest.spyOn(TokenService.prototype, 'isAccessTokenBlacklisted').mockResolvedValue(false);

    await authenticate(req, res, next);

    expect(req.user).toEqual(mockPayload);
    expect(req.userId).toBe('user-123');
    expect(req.userRole).toBe('donor');
    expect(next).toHaveBeenCalled();
  });
});

describe('Authorization Middleware', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should allow user with matching role', () => {
    req = { userRole: UserRole.ADMIN };
    const middleware = authorize(UserRole.ADMIN);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should throw AppError for user with forbidden role', () => {
    req = { userRole: UserRole.USER };
    const middleware = authorize(UserRole.ADMIN);

    try {
      middleware(req, res, next);
    } catch (err: any) {
      expect(err.statusCode).toBe(403);
    }
  });
});
