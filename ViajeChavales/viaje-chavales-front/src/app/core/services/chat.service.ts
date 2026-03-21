import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { LOCAL_STORAGE_KEYS } from '../consts/local-storage-key';
import { environment } from '../enviroment/enviroment';
import { ChatMessage } from '../interfaces/chat.interfaces';

interface ChatHistoryPayload {
  messages: ChatMessage[];
}

interface ChatAck {
  status: string;
  data?: ChatMessage;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socketUrl = environment.socketUrl;
  private socket: Socket | null = null;
  private socketInitialized = false;

  constructor() {}

  setupEventListeners(): void {
    if (!this.socket) {
      return;
    }

    this.socket.on('connect', () => {
      console.log('Conectado al servidor WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor WebSocket');
    });

    this.socket.on('connect_error', (err) => {
      console.error('Error de conexion:', err.message);
    });
  }

  public initializeSocket(): void {
    if (this.socketInitialized) {
      return;
    }

    this.socket = io(this.socketUrl, {
      auth: {
        token: localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS),
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
      path: '/socket.io',
      autoConnect: false,
    });

    this.setupEventListeners();
    this.socket.connect();
    this.socketInitialized = true;
  }

  joinChat(chatId: string): void {
    if (!this.socket) {
      return;
    }

    if (this.socket.connected) {
      this.socket.emit('join_chat', chatId);
      return;
    }

    this.socket.once('connect', () => {
      this.socket?.emit('join_chat', chatId);
    });
  }

  sendMessage(chatId: string, userId: string, message: string): Promise<ChatMessage> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject('Not connected to WebSocket server');
        return;
      }

      this.socket.emit(
        'new_message',
        { chatId, userId, message },
        (response: ChatAck) => {
          if (response?.status === 'success' || response?.status === 'ok') {
            if (response.data) {
              resolve(response.data);
              return;
            }

            reject('Missing chat payload');
            return;
          }

          reject(response?.error || 'Unknown error');
        }
      );
    });
  }

  onNewMessage(): Observable<ChatMessage> {
    return new Observable((observer) => {
      if (!this.socket) {
        observer.error('Socket not initialized');
        return;
      }

      const listener = (data: ChatMessage) => observer.next(data);
      this.socket.on('new_message', listener);

      return () => {
        this.socket?.off('new_message', listener);
      };
    });
  }

  initChat(): Observable<ChatMessage[]> {
    return new Observable((observer) => {
      if (!this.socket) {
        observer.error('Socket not initialized');
        return;
      }

      const listener = (data: ChatHistoryPayload) => {
        observer.next(data.messages);
      };
      this.socket.on('messages', listener);

      return () => {
        this.socket?.off('messages', listener);
      };
    });
  }

  get connectionState(): Observable<boolean> {
    return new Observable((observer) => {
      if (!this.socket) {
        observer.next(false);
        return;
      }

      const connectListener = () => observer.next(true);
      const disconnectListener = () => observer.next(false);

      this.socket.on('connect', connectListener);
      this.socket.on('disconnect', disconnectListener);
      observer.next(this.socket.connected);

      return () => {
        this.socket?.off('connect', connectListener);
        this.socket?.off('disconnect', disconnectListener);
      };
    });
  }

  disconnect(): void {
    if (!this.socket) {
      return;
    }

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    this.socketInitialized = false;
  }
}
