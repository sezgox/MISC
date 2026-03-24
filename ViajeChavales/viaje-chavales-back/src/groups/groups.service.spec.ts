import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { GroupsService } from './groups.service';

describe('GroupsService dissolveGroup', () => {
  const prisma = {
    groupMembership: {
      findUnique: jest.fn(),
    },
    group: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const buildService = () => new GroupsService(prisma as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws Forbidden when user is not a member', async () => {
    prisma.groupMembership.findUnique.mockResolvedValue(null);

    await expect(buildService().dissolveGroup('g1', 'alice')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws Forbidden when user is not Admin', async () => {
    prisma.groupMembership.findUnique.mockResolvedValue({
      userId: 'alice',
      groupId: 'g1',
      userRole: UserRole.Tripper,
    });

    await expect(buildService().dissolveGroup('g1', 'alice')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws NotFound when group does not exist', async () => {
    prisma.groupMembership.findUnique.mockResolvedValue({
      userId: 'alice',
      groupId: 'g1',
      userRole: UserRole.Admin,
    });
    prisma.group.findUnique.mockResolvedValue(null);

    await expect(buildService().dissolveGroup('g1', 'alice')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('runs transaction and returns ok for Admin', async () => {
    prisma.groupMembership.findUnique.mockResolvedValue({
      userId: 'alice',
      groupId: 'g1',
      userRole: UserRole.Admin,
    });
    prisma.group.findUnique.mockResolvedValue({ id: 'g1', name: 'G' });

    prisma.$transaction.mockImplementation(async (fn: (tx: any) => Promise<void>) => {
      const tx = {
        trip: {
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
          deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        chatMessage: {
          deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        groupMembership: {
          findMany: jest.fn().mockResolvedValue([{ userId: 'alice' }]),
          findFirst: jest.fn().mockResolvedValue(null),
        },
        group: {
          delete: jest.fn().mockResolvedValue({ id: 'g1' }),
        },
        user: {
          findUnique: jest.fn().mockResolvedValue({ activeGroupId: 'g1' }),
          update: jest.fn().mockResolvedValue({}),
        },
      };
      await fn(tx);

      expect(tx.trip.updateMany).toHaveBeenCalledWith({
        where: { groupId: 'g1' },
        data: {
          acceptedAccommodationProposalId: null,
          acceptedTransportProposalId: null,
          acceptedVisitProposalId: null,
        },
      });
      expect(tx.trip.deleteMany).toHaveBeenCalledWith({ where: { groupId: 'g1' } });
      expect(tx.chatMessage.deleteMany).toHaveBeenCalledWith({ where: { chatId: 'g1' } });
      expect(tx.group.delete).toHaveBeenCalledWith({ where: { id: 'g1' } });
      expect(tx.user.update).toHaveBeenCalledWith({
        where: { username: 'alice' },
        data: { activeGroupId: null },
      });
    });

    const result = await buildService().dissolveGroup('g1', 'alice');

    expect(result).toEqual({ ok: true, groupId: 'g1' });
  });
});
