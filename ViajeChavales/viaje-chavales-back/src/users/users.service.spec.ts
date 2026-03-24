import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';

describe('UsersService group moderation', () => {
  const prisma = {
    groupMembership: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
    trip: {
      findMany: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  };

  const buildService = () => new UsersService(prisma as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows an admin to validate a pending user', async () => {
    const service = buildService();

    prisma.groupMembership.findUnique
      .mockResolvedValueOnce({
        userId: 'admin',
        groupId: 'group-1',
        userRole: UserRole.Admin,
      })
      .mockResolvedValueOnce({
        userId: 'pending-user',
        groupId: 'group-1',
        userRole: UserRole.Pending,
      })
      .mockResolvedValueOnce({
        userId: 'pending-user',
        groupId: 'group-1',
        userRole: UserRole.Tripper,
        user: {
          username: 'pending-user',
          profilePicture: 'avatar.png',
          createdAt: new Date('2026-03-23T10:00:00.000Z'),
          updatedAt: new Date('2026-03-23T10:00:00.000Z'),
          activeGroupId: 'group-1',
        },
      });

    const result = await service.updateRole('admin', 'pending-user', UserRole.Tripper, 'group-1');

    expect(prisma.groupMembership.update).toHaveBeenCalledWith({
      where: {
        userId_groupId: {
          userId: 'pending-user',
          groupId: 'group-1',
        },
      },
      data: { userRole: UserRole.Tripper },
    });
    expect(result.userRole).toBe(UserRole.Tripper);
  });

  it('rejects validation when actor is not admin', async () => {
    const service = buildService();

    prisma.groupMembership.findUnique
      .mockResolvedValueOnce({
        userId: 'tripper',
        groupId: 'group-1',
        userRole: UserRole.Tripper,
      })
      .mockResolvedValueOnce({
        userId: 'pending-user',
        groupId: 'group-1',
        userRole: UserRole.Pending,
      });

    await expect(
      service.updateRole('tripper', 'pending-user', UserRole.Tripper, 'group-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects demoting another admin', async () => {
    const service = buildService();

    prisma.groupMembership.findUnique
      .mockResolvedValueOnce({
        userId: 'admin',
        groupId: 'group-1',
        userRole: UserRole.Admin,
      })
      .mockResolvedValueOnce({
        userId: 'other-admin',
        groupId: 'group-1',
        userRole: UserRole.Admin,
      });

    await expect(
      service.updateRole('admin', 'other-admin', UserRole.Tripper, 'group-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows an admin to reject (remove) a pending user without active trip relations', async () => {
    const service = buildService();

    prisma.groupMembership.findUnique
      .mockResolvedValueOnce({
        userId: 'admin',
        groupId: 'group-1',
        userRole: UserRole.Admin,
      })
      .mockResolvedValueOnce({
        userId: 'pending-user',
        groupId: 'group-1',
        userRole: UserRole.Pending,
        user: {
          username: 'pending-user',
          profilePicture: 'avatar.png',
          createdAt: new Date('2026-03-23T10:00:00.000Z'),
          updatedAt: new Date('2026-03-23T10:00:00.000Z'),
          activeGroupId: 'group-1',
        },
      });
    prisma.trip.findMany.mockResolvedValue([]);
    prisma.groupMembership.findFirst.mockResolvedValue({
      groupId: 'group-2',
    });

    const result = await service.remove('admin', 'pending-user', 'group-1');

    expect(prisma.groupMembership.delete).toHaveBeenCalledWith({
      where: {
        userId_groupId: {
          userId: 'pending-user',
          groupId: 'group-1',
        },
      },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { username: 'pending-user' },
      data: { activeGroupId: 'group-2' },
    });
    expect(result.userRole).toBe(UserRole.Pending);
  });

  it('rejects removing another admin', async () => {
    const service = buildService();

    prisma.groupMembership.findUnique
      .mockResolvedValueOnce({
        userId: 'admin',
        groupId: 'group-1',
        userRole: UserRole.Admin,
      })
      .mockResolvedValueOnce({
        userId: 'other-admin',
        groupId: 'group-1',
        userRole: UserRole.Admin,
        user: {
          username: 'other-admin',
          profilePicture: 'avatar.png',
          createdAt: new Date('2026-03-23T10:00:00.000Z'),
          updatedAt: new Date('2026-03-23T10:00:00.000Z'),
          activeGroupId: 'group-1',
        },
      });

    await expect(service.remove('admin', 'other-admin', 'group-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('rejects removing users with active planning trip relations', async () => {
    const service = buildService();

    prisma.groupMembership.findUnique
      .mockResolvedValueOnce({
        userId: 'admin',
        groupId: 'group-1',
        userRole: UserRole.Admin,
      })
      .mockResolvedValueOnce({
        userId: 'pending-user',
        groupId: 'group-1',
        userRole: UserRole.Pending,
        user: {
          username: 'pending-user',
          profilePicture: 'avatar.png',
          createdAt: new Date('2026-03-23T10:00:00.000Z'),
          updatedAt: new Date('2026-03-23T10:00:00.000Z'),
          activeGroupId: 'group-1',
        },
      });
    prisma.trip.findMany.mockResolvedValue([{ id: 99 }]);

    await expect(service.remove('admin', 'pending-user', 'group-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
