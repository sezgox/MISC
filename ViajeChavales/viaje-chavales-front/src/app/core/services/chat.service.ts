import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { LOCAL_STORAGE_KEYS } from '../consts/local-storage-key';
import { environment } from '../enviroment/enviroment';
import { ChatMessage, GroupChatMessages } from '../interfaces/chat.interfaces';

interface ChatHistoryPayload {
  groupId?: string;
  chatId?: string;
  messages: ChatMessage[];
}

interface ChatAck {
  status: string;
  data?: ChatMessage;
  error?: string;
}

interface NewMessagePayload {
  groupId: string;
  message: string;
  userId: string;
  date?: string | Date;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socketUrl = environment.socketUrl;
  private socket: Socket | null = null;
  private socketInitialized = false;
  private socketEventsBound = false;
  private joinedGroups = new Set<string>();
  private chatByGroup = new Map<string, ChatMessage[]>();

  constructor() {}

  private normalizeMessage(raw: ChatMessage, fallbackGroupId?: string): ChatMessage {
    const groupId = raw.groupId ?? raw.chatId ?? fallbackGroupId;
    if (!groupId) {
      throw new Error('Chat message without groupId');
    }

    return {
      id: raw.id,
      userId: raw.userId,
      groupId,
      message: raw.message,
      date: raw.date,
    };
  }

  private updateGroupMessages(groupId: string, messages: ChatMessage[]) {
    this.chatByGroup.set(groupId, messages);
  }

  private appendMessage(message: ChatMessage) {
    const current = this.chatByGroup.get(message.groupId) ?? [];
    this.chatByGroup.set(message.groupId, [...current, message]);
  }

  getChatsSnapshot(): GroupChatMessages[] {
    return Array.from(this.chatByGroup.entries()).map(([groupId, messages]) => ({
      groupId,
      messages: [...messages],
    }));
  }

  getMessagesForGroup(groupId: string): ChatMessage[] {
    return [...(this.chatByGroup.get(groupId) ?? [])];
  }

  setupEventListeners(): void {
    if (!this.socket || this.socketEventsBound) {
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

    this.socketEventsBound = true;
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

  joinChat(groupId: string): void {
    if (!this.socket) {
      return;
    }

    const payload = { groupId };
    if (this.socket.connected) {
      this.socket.emit('join_chat', payload);
      this.joinedGroups.add(groupId);
      return;
    }

    this.socket.once('connect', () => {
      this.socket?.emit('join_chat', payload);
      this.joinedGroups.add(groupId);
    });
  }

  leaveChat(groupId: string): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    this.socket.emit('leave_chat', { groupId });
    this.joinedGroups.delete(groupId);
  }

  joinChats(groupIds: string[]): void {
    const uniqueGroupIds = Array.from(new Set(groupIds.filter(Boolean)));
    uniqueGroupIds.forEach((groupId) => this.joinChat(groupId));
  }

  sendMessage(groupId: string, userId: string, message: string): Promise<ChatMessage> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject('Not connected to WebSocket server');
        return;
      }

      const payload: NewMessagePayload = {
        groupId,
        userId,
        message,
        date: new Date().toISOString(),
      };

      this.socket.emit('new_message', payload, (response: ChatAck) => {
        if (response?.status === 'success' || response?.status === 'ok') {
          if (response.data) {
            const normalized = this.normalizeMessage(response.data, groupId);
            this.appendMessage(normalized);
            resolve(normalized);
            return;
          }

          reject('Missing chat payload');
          return;
        }

        reject(response?.error || 'Unknown error');
      });
    });
  }

  onNewMessage(): Observable<ChatMessage> {
    return new Observable((observer) => {
      if (!this.socket) {
        observer.error('Socket not initialized');
        return;
      }

      const listener = (data: ChatMessage) => {
        try {
          const normalized = this.normalizeMessage(data);
          this.appendMessage(normalized);
          observer.next(normalized);
        } catch (error) {
          observer.error(error);
        }
      };
      this.socket.on('new_message', listener);

      return () => {
        this.socket?.off('new_message', listener);
      };
    });
  }

  initChat(): Observable<GroupChatMessages> {
    return new Observable((observer) => {
      if (!this.socket) {
        observer.error('Socket not initialized');
        return;
      }

      const listener = (data: ChatHistoryPayload) => {
        try {
          const groupId = data.groupId ?? data.chatId;
          if (!groupId) {
            return;
          }

          const normalizedMessages = data.messages.map((message) =>
            this.normalizeMessage(message, groupId),
          );
          this.updateGroupMessages(groupId, normalizedMessages);
          observer.next({ groupId, messages: normalizedMessages });
        } catch (error) {
          observer.error(error);
        }
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
    this.socketEventsBound = false;
    this.joinedGroups.clear();
    this.chatByGroup.clear();
  }
}
