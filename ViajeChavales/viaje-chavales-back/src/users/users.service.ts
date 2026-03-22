import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/db.service';
import { CreateUserDto } from './dto/create-user.dto';

type PublicUserProfile = {
  username: string;
  profilePicture: string;
  groupId: string;
  userRole: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private toPublicProfile(
    user: {
      username: string;
      profilePicture: string;
      createdAt: Date;
      updatedAt: Date;
    },
    membership: {
      groupId: string;
      userRole: UserRole;
    },
  ): PublicUserProfile {
    return {
      username: user.username,
      profilePicture: user.profilePicture,
      groupId: membership.groupId,
      userRole: membership.userRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async getMembershipForUserOrThrow(username: string, groupId: string) {
    const membership = await this.prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId: username,
          groupId,
        },
      },
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true,
            createdAt: true,
            updatedAt: true,
            activeGroupId: true,
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('User not found in this group');
    }

    return membership;
  }

  async create(user: CreateUserDto) {
    const group = await this.prisma.group.findUnique({
      where: { id: user.groupId },
    });

    if (!group) {
      throw new BadRequestException('Group not found');
    }

    const membersInGroup = await this.prisma.groupMembership.count({
      where: { groupId: user.groupId },
    });
    const userRole = membersInGroup === 0 ? UserRole.Admin : UserRole.Pending;

    const created = await this.prisma.user.create({
      data: {
        username: user.username,
        password: user.password,
        profilePicture: user.profilePicture,
        activeGroupId: user.groupId,
        memberships: {
          create: {
            groupId: user.groupId,
            userRole,
          },
        },
      },
      include: {
        memberships: {
          where: { groupId: user.groupId },
          select: {
            groupId: true,
            userRole: true,
          },
        },
      },
    });

    return this.toPublicProfile(created, created.memberships[0]);
  }

  async findAll(groupId: string) {
    const memberships = await this.prisma.groupMembership.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: [{ userRole: 'desc' }, { userId: 'asc' }],
    });

    return memberships.map((membership) => this.toPublicProfile(membership.user, membership));
  }

  async findOne(username: string, groupId: string) {
    const membership = await this.getMembershipForUserOrThrow(username, groupId);
    return this.toPublicProfile(membership.user, membership);
  }

  async findOneWithPassword(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        memberships: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async listGroups(username: string) {
    const memberships = await this.prisma.groupMembership.findMany({
      where: { userId: username },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { activeGroupId: true },
    });

    return memberships.map((membership) => ({
      groupId: membership.groupId,
      groupName: membership.group.name,
      userRole: membership.userRole,
      isActive: membership.groupId === user?.activeGroupId,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    }));
  }

  async setActiveGroup(username: string, groupId: string) {
    const membership = await this.prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId: username,
          groupId,
        },
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('User does not belong to this group');
    }

    await this.prisma.user.update({
      where: { username },
      data: { activeGroupId: groupId },
    });

    return {
      groupId: membership.group.id,
      groupName: membership.group.name,
      userRole: membership.userRole,
    };
  }

  async joinGroup(username: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const existingMembership = await this.prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId: username,
          groupId,
        },
      },
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (existingMembership) {
      return this.toPublicProfile(existingMembership.user, existingMembership);
    }

    const memberCount = await this.prisma.groupMembership.count({ where: { groupId } });
    const userRole = memberCount === 0 ? UserRole.Admin : UserRole.Pending;

    const membership = await this.prisma.groupMembership.create({
      data: {
        userId: username,
        groupId,
        userRole,
      },
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true,
            createdAt: true,
            updatedAt: true,
            activeGroupId: true,
          },
        },
      },
    });

    if (!membership.user.activeGroupId) {
      await this.prisma.user.update({
        where: { username },
        data: { activeGroupId: groupId },
      });
    }

    return this.toPublicProfile(membership.user, membership);
  }

  async updateRole(actorUsername: string, targetUsername: string, userRole: UserRole, groupId: string) {
    const actorMembership = await this.prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId: actorUsername,
          groupId,
        },
      },
    });
    const targetMembership = await this.prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId: targetUsername,
          groupId,
        },
      },
    });

    if (!actorMembership || !targetMembership) {
      throw new NotFoundException('User not found in this group');
    }

    if (actorMembership.userRole !== UserRole.Admin) {
      throw new ForbiddenException('Only admins can update group roles');
    }

    if (targetMembership.userRole === UserRole.Admin && userRole !== UserRole.Admin) {
      throw new ForbiddenException('Admins cannot demote another admin');
    }

    if (targetUsername === actorUsername && targetMembership.userRole === UserRole.Admin && userRole !== UserRole.Admin) {
      throw new ForbiddenException('Admins cannot remove their own admin role');
    }

    await this.prisma.groupMembership.update({
      where: {
        userId_groupId: {
          userId: targetUsername,
          groupId,
        },
      },
      data: { userRole },
    });

    return this.findOne(targetUsername, groupId);
  }

  async remove(actorUsername: string, targetUsername: string, groupId: string) {
    const actorMembership = await this.prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId: actorUsername,
          groupId,
        },
      },
    });
    const targetMembership = await this.prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId: targetUsername,
          groupId,
        },
      },
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true,
            createdAt: true,
            updatedAt: true,
            activeGroupId: true,
          },
        },
      },
    });

    if (!actorMembership || !targetMembership) {
      throw new NotFoundException('User not found in this group');
    }

    if (actorMembership.userRole !== UserRole.Admin) {
      throw new ForbiddenException('Only admins can expel group users');
    }

    if (targetMembership.userRole === UserRole.Admin) {
      throw new ForbiddenException('Admins cannot expel another admin');
    }

    const activePlanningTrips = await this.prisma.trip.findMany({
      where: {
        groupId,
        status: 'Planning',
        OR: [
          { plannerUsername: targetUsername },
          { participants: { some: { userId: targetUsername } } },
          { tripRoles: { some: { userId: targetUsername } } },
          { proposals: { some: { createdByUsername: targetUsername } } },
        ],
      },
      select: { id: true },
      take: 1,
    });

    if (activePlanningTrips.length > 0) {
      throw new ForbiddenException('User has active trip relations and cannot be expelled');
    }

    await this.prisma.groupMembership.delete({
      where: {
        userId_groupId: {
          userId: targetUsername,
          groupId,
        },
      },
    });

    if (targetMembership.user.activeGroupId === groupId) {
      const nextMembership = await this.prisma.groupMembership.findFirst({
        where: { userId: targetUsername },
        orderBy: { createdAt: 'asc' },
      });

      await this.prisma.user.update({
        where: { username: targetUsername },
        data: { activeGroupId: nextMembership?.groupId ?? null },
      });
    }

    return this.toPublicProfile(targetMembership.user, targetMembership);
  }
}
