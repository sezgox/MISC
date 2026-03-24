import { ForbiddenException, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConfig } from 'src/core/consts/jwt-config';
import { PrismaService } from 'src/db.service';

type JwtPayload = {
  sub: string;
  group?: string | null;
  role?: string | null;
};

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private readRequestedGroupId(req: any): string | undefined {
    const value = req.headers['x-group-id'];
    if (Array.isArray(value)) {
      return value[0];
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
    return undefined;
  }

  private canProceedWithoutMembership(req: any): boolean {
    if (typeof req.path !== 'string') {
      return false;
    }

    if (req.path.startsWith('/freedays')) {
      return true;
    }

    if (req.path === '/users/groups') {
      return true;
    }

    return /^\/users\/groups\/[^/]+\/join$/.test(req.path);
  }

  async use(req: any, res: any, next: () => void) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.json(new UnauthorizedException('Token not provided'));
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: jwtConfig.secret,
      });

      const user = await this.prisma.user.findUnique({
        where: { username: payload.sub },
        select: {
          username: true,
          activeGroupId: true,
          memberships: {
            select: {
              groupId: true,
              userRole: true,
            },
          },
        },
      });

      if (!user) {
        return res.json(new UnauthorizedException('User not found'));
      }

      if (user.memberships.length === 0) {
        if (this.canProceedWithoutMembership(req)) {
          req['user'] = {
            sub: user.username,
            group: null,
            role: null,
          };
          next();
          return;
        }

        return res.json(new UnauthorizedException('User has no groups'));
      }

      const requestedGroupId = this.readRequestedGroupId(req);
      let membership =
        (requestedGroupId
          ? user.memberships.find((item) => item.groupId === requestedGroupId)
          : undefined) ??
        user.memberships.find((item) => item.groupId === user.activeGroupId) ??
        user.memberships.find((item) => item.groupId === payload.group) ??
        user.memberships[0];

      if (!membership) {
        return res.json(new UnauthorizedException('No active group found'));
      }

      if (requestedGroupId && membership.groupId !== requestedGroupId) {
        res.status(403);
        return res.json(new ForbiddenException('User does not belong to requested group'));
      }

      if (!requestedGroupId && user.activeGroupId !== membership.groupId) {
        await this.prisma.user.update({
          where: { username: user.username },
          data: { activeGroupId: membership.groupId },
        });
      }

      req['user'] = {
        sub: user.username,
        group: membership.groupId,
        role: membership.userRole,
      };
      next();
    } catch {
      return res.json(new UnauthorizedException('Invalid or expired token'));
    }
  }
}
