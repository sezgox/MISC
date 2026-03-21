import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatMessage } from '../../../core/interfaces/chat.interfaces';
import { ChatService } from '../../../core/services/chat.service';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  private uservice = inject(UsersService);
  private groupId: string = '';
  private username: string = '';
  public chatOpen: boolean = false;
  private chatService = inject(ChatService);
  public newMessage: string = '';
  private subs: Subscription[] = [];
  public isConnected: boolean = false;
  public messages: ChatMessage[] = [];
  public isAvailable: boolean = true;

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
    this.chatService.disconnect();
  }

  async ngOnInit(): Promise<void> {
    const user = await this.uservice.getCurrentUser();
    if (user.userRole === 'Pending') {
      this.isAvailable = false;
      return;
    }

    this.username = user.username;
    this.groupId = user.groupId;
    this.chatService.initializeSocket();

    this.subs.push(
      this.chatService.connectionState.subscribe((connected) => {
        this.isConnected = connected;
        if (connected) {
          this.chatService.joinChat(this.groupId);
        }
      })
    );

    this.subs.push(
      this.chatService.onNewMessage().subscribe({
        next: (message) => {
          this.messages.push(message);
        },
        error: (err) => console.error('Error en mensajes:', err)
      })
    );

    this.subs.push(
      this.chatService.initChat().subscribe({
        next: (messages) => {
          this.messages = messages;
        },
        error: (err) => console.error('Error al cargar mensajes iniciales:', err)
      })
    );
  }

  async sendMessage() {
    if (this.newMessage === '') {
      return;
    }

    this.chatService.sendMessage(this.groupId, this.username, this.newMessage)
      .then((message) => {
        this.messages.push(message);
        this.newMessage = '';
      })
      .catch((err) => {
        console.error('', err);
      });
  }
}
