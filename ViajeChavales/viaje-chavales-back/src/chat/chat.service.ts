import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/db.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  private async assertChatAccess(userId: string, chatId: string) {
    const membership = await this.prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: chatId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('User cannot access this chat');
    }

    if (membership.userRole === UserRole.Pending) {
      throw new ForbiddenException('Pending users cannot use group chat');
    }

    return membership;
  }

  async getMessages(chatId: string, userId: string) {
    await this.assertChatAccess(userId, chatId);

    return this.prisma.chatMessage.findMany({
      where: {
        chatId,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async addMessage(userId: string, chatId: string, message: string) {
    await this.assertChatAccess(userId, chatId);
    return this.prisma.chatMessage.create({ data: { userId, chatId, message } });
  }
}
