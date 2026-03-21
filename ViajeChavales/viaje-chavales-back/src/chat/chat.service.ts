import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/db.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  private async assertChatAccess(userId: string, chatId: string) {
    const user = await this.prisma.user.findUnique({ where: { username: userId } });

    if (!user || user.groupId !== chatId) {
      throw new ForbiddenException('User cannot access this chat');
    }

    if (user.userRole === UserRole.Pending) {
      throw new ForbiddenException('Pending users cannot use group chat');
    }

    return user;
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
