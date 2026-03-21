import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/db.service';
import { CreateUserDto } from './dto/create-user.dto';

const publicUserSelect = {
  username: true,
  profilePicture: true,
  groupId: true,
  userRole: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: CreateUserDto) {
    const group = await this.prisma.group.findUnique({
      where: { id: user.groupId },
      include: {
        members: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!group) {
      throw new BadRequestException('Group not found');
    }

    const userRole = group.members.length === 0 ? UserRole.Admin : UserRole.Pending;

    return this.prisma.user.create({
      data: {
        ...user,
        userRole,
      },
      select: publicUserSelect,
    });
  }

  async findAll(groupId: string) {
    return this.prisma.user.findMany({
      where: { groupId },
      select: publicUserSelect,
      orderBy: [
        { userRole: 'desc' },
        { username: 'asc' },
      ],
    });
  }

  async findOne(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: publicUserSelect,
    });
  }

  async findOneWithPassword(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async updateRole(actorUsername: string, targetUsername: string, userRole: UserRole) {
    const actor = await this.prisma.user.findUnique({ where: { username: actorUsername } });
    const target = await this.prisma.user.findUnique({ where: { username: targetUsername } });

    if (!actor || !target) {
      throw new NotFoundException('User not found');
    }

    if (actor.groupId !== target.groupId) {
      throw new ForbiddenException('Users do not belong to the same group');
    }

    if (actor.userRole !== UserRole.Admin) {
      throw new ForbiddenException('Only admins can update group roles');
    }

    if (target.userRole === UserRole.Admin && userRole !== UserRole.Admin) {
      throw new ForbiddenException('Admins cannot demote another admin');
    }

    if (target.username === actor.username && target.userRole === UserRole.Admin && userRole !== UserRole.Admin) {
      throw new ForbiddenException('Admins cannot remove their own admin role');
    }

    return this.prisma.user.update({
      where: { username: targetUsername },
      data: { userRole },
      select: publicUserSelect,
    });
  }

  async remove(actorUsername: string, targetUsername: string) {
    const actor = await this.prisma.user.findUnique({ where: { username: actorUsername } });
    const target = await this.prisma.user.findUnique({ where: { username: targetUsername } });

    if (!actor || !target) {
      throw new NotFoundException('User not found');
    }

    if (actor.groupId !== target.groupId) {
      throw new ForbiddenException('Users do not belong to the same group');
    }

    if (actor.userRole !== UserRole.Admin) {
      throw new ForbiddenException('Only admins can expel group users');
    }

    if (target.userRole === UserRole.Admin) {
      throw new ForbiddenException('Admins cannot expel another admin');
    }

    const activePlanningTrips = await this.prisma.trip.findMany({
      where: {
        groupId: target.groupId,
        status: 'Planning',
        OR: [
          { plannerUsername: target.username },
          { participants: { some: { userId: target.username } } },
          { tripRoles: { some: { userId: target.username } } },
          { proposals: { some: { createdByUsername: target.username } } },
        ],
      },
      select: {
        id: true,
      },
      take: 1,
    });

    if (activePlanningTrips.length > 0) {
      throw new ForbiddenException('User has active trip relations and cannot be expelled');
    }

    return this.prisma.user.delete({
      where: { username: targetUsername },
      select: publicUserSelect,
    });
  }
}
