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
  async handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    const user = this.getSocketUser(client);
    const messages = await this.chatService.getMessages(chatId, user.sub);
    client.join(chatId);
    client.emit('messages', { chatId, messages });
    client.emit('joined_chat', { chatId, status: 'success' });
  }

  @SubscribeMessage('leave_chat')
  handleLeaveChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    client.leave(chatId);
    client.emit('left_chat', { chatId, status: 'success' });
  }

  @SubscribeMessage('new_message')
  async handleNewMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId: string; userId: string; message: string },
  ) {
    const user = this.getSocketUser(client);

    if (user.sub !== payload.userId) {
      throw new WsException('Invalid message payload');
    }

    const savedMessage = await this.chatService.addMessage(
      payload.userId,
      payload.chatId,
      payload.message,
    );

    client.to(payload.chatId).emit('new_message', savedMessage);

    return {
      status: 'success',
      data: savedMessage,
      timestamp: new Date().toISOString(),
    };
  }
}
