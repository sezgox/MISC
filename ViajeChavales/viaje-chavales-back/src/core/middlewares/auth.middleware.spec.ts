import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthMiddleware } from './auth.middleware';

describe('AuthMiddleware', () => {
  const jwtService = {
    verifyAsync: jest.fn(),
  } as unknown as JwtService;

  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const buildRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows freedays route for users without memberships', async () => {
    const middleware = new AuthMiddleware(jwtService, prisma as any);
    const req: any = {
      headers: { authorization: 'Bearer token' },
      path: '/freedays',
    };
    const res = buildRes();
    const next = jest.fn();

    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'alice' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      username: 'alice',
      activeGroupId: null,
      memberships: [],
    });

    await middleware.use(req, res as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({
      sub: 'alice',
      group: null,
      role: null,
    });
    expect(res.json).not.toHaveBeenCalled();
  });

  it('rejects non-freedays routes for users without memberships', async () => {
    const middleware = new AuthMiddleware(jwtService, prisma as any);
    const req: any = {
      headers: { authorization: 'Bearer token' },
      path: '/users',
    };
    const res = buildRes();
    const next = jest.fn();

    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'alice' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      username: 'alice',
      activeGroupId: null,
      memberships: [],
    });

    await middleware.use(req, res as any, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json.mock.calls[0][0]).toBeInstanceOf(UnauthorizedException);
  });

  it('allows users/groups routes for users without memberships', async () => {
    const middleware = new AuthMiddleware(jwtService, prisma as any);
    const req: any = {
      headers: { authorization: 'Bearer token' },
      path: '/users/groups',
    };
    const res = buildRes();
    const next = jest.fn();

    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'alice' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      username: 'alice',
      activeGroupId: null,
      memberships: [],
    });

    await middleware.use(req, res as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({
      sub: 'alice',
      group: null,
      role: null,
    });
    expect(res.json).not.toHaveBeenCalled();
  });
});
