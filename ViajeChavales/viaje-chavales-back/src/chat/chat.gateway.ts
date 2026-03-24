import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { jwtConfig } from 'src/core/consts/jwt-config';
import { ChatService } from './chat.service';

type SocketUserPayload = {
  sub: string;
};

type JoinChatPayload = {
  groupId: string;
};

type NewMessagePayload = {
  groupId: string;
  userId: string;
  message: string;
  date?: string | Date;
};

type PersistedChatMessage = {
  id: number;
  userId: string;
  message: string;
  chatId: string;
  date: Date;
};

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  private getSocketUser(client: Socket) {
    const user = client.data.user as SocketUserPayload | undefined;
    if (!user) {
      throw new WsException('Unauthorized socket');
    }
    return user;
  }

  private toSocketMessage(message: PersistedChatMessage) {
    return {
      id: message.id,
      userId: message.userId,
      groupId: message.chatId,
      message: message.message,
      date: message.date,
    };
  }

  private resolveGroupId(payload: JoinChatPayload | string) {
    if (typeof payload === 'string') {
      return payload;
    }

    return payload.groupId;
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string | undefined;
      if (!token) {
        throw new WsException('Token not provided');
      }

      const payload = await this.jwtService.verifyAsync<SocketUserPayload>(token, {
        secret: jwtConfig.secret,
      });

      client.data.user = payload;
    } catch (error) {
      client.emit('error', { message: error.message ?? 'Invalid socket token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinChatPayload | string,
  ) {
    const user = this.getSocketUser(client);
    const groupId = this.resolveGroupId(payload);
    const messages = await this.chatService.getMessages(groupId, user.sub);
    client.join(groupId);
    client.emit('messages', {
      groupId,
      messages: messages.map((message) => this.toSocketMessage(message as PersistedChatMessage)),
    });
    client.emit('joined_chat', { groupId, status: 'success' });
  }

  @SubscribeMessage('leave_chat')
  handleLeaveChat(@ConnectedSocket() client: Socket, @MessageBody() payload: JoinChatPayload | string) {
    const groupId = this.resolveGroupId(payload);
    client.leave(groupId);
    client.emit('left_chat', { groupId, status: 'success' });
  }

  @SubscribeMessage('new_message')
  async handleNewMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: NewMessagePayload,
  ) {
    const user = this.getSocketUser(client);

    if (user.sub !== payload.userId) {
      throw new WsException('Invalid message payload');
    }

    const savedMessage = await this.chatService.addMessage(
      payload.userId,
      payload.groupId,
      payload.message,
    );

    const socketMessage = this.toSocketMessage(savedMessage as PersistedChatMessage);

    client.to(payload.groupId).emit('new_message', socketMessage);

    return {
      status: 'success',
      data: socketMessage,
      timestamp: new Date().toISOString(),
    };
  }
}
