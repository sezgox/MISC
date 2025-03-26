import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

    async getMessages(chatId: string) {
        return this.prisma.chatMessage.findMany({
            where: {
                chatId: chatId
            }
        });
    }

    async addMessage(userId: string, chatId: string, message: string) { 
        return this.prisma.chatMessage.create({data: {userId, chatId, message}});
    }
}
