import { Module } from '@nestjs/common';
import { PrismaService } from 'src/db.service';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  providers: [ChatGateway, ChatService, PrismaService],
})
export class ChatModule {}
