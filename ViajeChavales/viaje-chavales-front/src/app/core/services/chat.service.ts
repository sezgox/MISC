import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Manager } from 'socket.io-client';
import { environment } from '../enviroment/enviroment';
import { ChatMessage } from '../interfaces/chat.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = `${environment.apiUrl}/freedays`;
  private socket: any;

  constructor() {
    // Asegúrate que esta URL sea correcta (debe apuntar a tu servidor NestJS)
    this.apiUrl = environment.apiUrl; // Remueve el '/freedays' a menos que sea necesario

    const manager = new Manager(this.apiUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
      autoConnect: false
    });

    this.socket = manager.socket('/'); // Namespace raíz

    // Agrega logs para depuración
    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('⚠️ Desconectado del servidor WebSocket');
    });

    this.socket.on('connect_error', (err: any) => {
      console.error('❌ Error de conexión:', err.message);
    });

    this.socket.connect();
  }

  // Unirse a un chat (ahora más seguro)
  joinChat(chatId: string): void {
    if (this.socket.connected) {
      this.socket.emit('join_chat', chatId);
    } else {
      this.socket.on('connect', () => {
        this.socket.emit('join_chat', chatId);
      });
    }
  }

  // Enviar mensaje con confirmación
  sendMessage(chatId: string, userId: string, message: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject('Not connected to WebSocket server');
        return;
      }

      this.socket.emit(
        'new_message',
        { chatId, userId, message },
        (response: { status: string; data?: ChatMessage; error?: string }) => {
          if (response?.status === 'success' || response?.status === 'ok') {
            resolve(response.data);
          } else {
            reject(response?.error || 'Unknown error');
          }
        }
      );
    });
  }

  // Escuchar mensajes (mejorado)
  onNewMessage(): Observable<any> {
    return new Observable(observer => {
      const listener = (data: any) => observer.next(data);
      this.socket.on('new_message', listener);

      // Limpieza al desuscribirse
      return () => this.socket.off('new_message', listener);
    });
  }

  // Estado de conexión
  get connectionState(): Observable<boolean> {
    return new Observable(observer => {
      const connectListener = () => observer.next(true);
      const disconnectListener = () => observer.next(false);

      this.socket.on('connect', connectListener);
      this.socket.on('disconnect', disconnectListener);

      // Estado inicial
      observer.next(this.socket.connected);

      // Limpieza
      return () => {
        this.socket.off('connect', connectListener);
        this.socket.off('disconnect', disconnectListener);
      };
    });
  }

  // Desconexión segura
  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }
  }
}
