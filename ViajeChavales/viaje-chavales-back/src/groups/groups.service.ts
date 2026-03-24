import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/db.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(id: string, name: string) {
    return this.prisma.group.create({ data: { id, name } });
  }

  findOne(id: string) {
    return this.prisma.group.findUnique({ where: { id } });
  }

  async findInvitePreview(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        members: {
          select: {
            userRole: true,
            user: {
              select: {
                username: true,
                profilePicture: true,
              },
            },
          },
          orderBy: [{ userRole: 'desc' }, { userId: 'asc' }],
        },
      },
    });

    if (!group) {
      return null;
    }

    return {
      id: group.id,
      name: group.name,
      createdAt: group.createdAt,
      members: group.members.map((member) => ({
        username: member.user.username,
        profilePicture: member.user.profilePicture,
        userRole: member.userRole,
      })),
    };
  }

  /**
   * Elimina el grupo y datos relacionados (viajes, chat, membresías).
   * Solo puede ejecutarlo un usuario con rol Admin en ese grupo.
   */
  async dissolveGroup(groupId: string, requesterUsername: string) {
    const membership = await this.prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId: requesterUsername,
          groupId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('No perteneces a este grupo');
    }

    if (membership.userRole !== UserRole.Admin) {
      throw new ForbiddenException('Solo un administrador del grupo puede disolverlo');
    }

    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.trip.updateMany({
        where: { groupId },
        data: {
          acceptedAccommodationProposalId: null,
          acceptedTransportProposalId: null,
          acceptedVisitProposalId: null,
        },
      });

      await tx.trip.deleteMany({ where: { groupId } });
      await tx.chatMessage.deleteMany({ where: { chatId: groupId } });

      const memberRows = await tx.groupMembership.findMany({
        where: { groupId },
        select: { userId: true },
      });

      for (const { userId } of memberRows) {
        const user = await tx.user.findUnique({
          where: { username: userId },
          select: { activeGroupId: true },
        });
        if (user?.activeGroupId !== groupId) {
          continue;
        }
        const other = await tx.groupMembership.findFirst({
          where: { userId, groupId: { not: groupId } },
          select: { groupId: true },
        });
        await tx.user.update({
          where: { username: userId },
          data: { activeGroupId: other?.groupId ?? null },
        });
      }

      await tx.group.delete({ where: { id: groupId } });
    });

    return { ok: true, groupId };
  }
}
