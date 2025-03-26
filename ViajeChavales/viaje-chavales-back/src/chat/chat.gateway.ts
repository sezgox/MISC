import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Ajusta esto en producción
    methods: ['GET', 'POST'],
    credentials: true
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_chat')
  handleJoinChat(client: Socket, chatId: string) {
    client.join(chatId);
    console.log(`Client ${client.id} joined chat ${chatId}`);
    // Confirmar la unión al chat
    client.emit('joined_chat', { chatId, status: 'success' });
  }

  @SubscribeMessage('new_message')
  async handleNewMessage(
    client: Socket,
    payload: { chatId: string; userId: string; message: string },
    callback?: (response: any) => void // Hacer el callback opcional
  ) {
    try {
      console.log('Received message payload:', payload);
      
      const savedMessage = await this.chatService.addMessage(
        payload.userId,
        payload.chatId,
        payload.message
      );
  
      console.log('Saved message:', savedMessage);
      
      // Emitir a todos los clientes en la sala EXCEPTO al remitente
      client.to(payload.chatId).emit('new_message', savedMessage);
      
      // Manejar tanto callback como return para mayor compatibilidad
      const response = { 
        status: 'success',
        data: savedMessage,
        timestamp: new Date().toISOString()
      };
  
      if (callback && typeof callback === 'function') {
        callback(response);
      }
      
      return response;
    } catch (error) {
      console.error('Error handling message:', error);
      const errorResponse = { 
        event: 'new_message_error',
        error: 'Failed to send message',
        details: error.message 
      };
  
      if (callback && typeof callback === 'function') {
        callback({ status: 'error', ...errorResponse });
      }
      
      client.emit('error', errorResponse);
      throw error; // Propagar el error para que NestJS lo maneje
    }
  }
}