import { Component, inject, OnInit } from '@angular/core';
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
export class ChatComponent implements OnInit{

    private uservice = inject(UsersService);
    private groupId: string = '';
    private username: string = '';
    public chatOpen: boolean = false;
    private chatService = inject(ChatService);
    public newMessage: string = '';
    private subs: Subscription[] = [];
    public isConnected: boolean = false;
    public messages: ChatMessage[] = [];

  async ngOnInit(): Promise<void> {
    const user = await this.uservice.getUser(localStorage.getItem('USER_DATA') ?? '');
    this.username = user.username;
    this.groupId = user.groupId;
    this.subs.push(
      this.chatService.connectionState.subscribe(connected => {
        this.isConnected = connected;
        if (connected) {
          this.chatService.joinChat(this.groupId);
        }
      })
    );

    // Suscribirse a mensajes
    this.subs.push(
      this.chatService.onNewMessage().subscribe({
        next: (res) => {
          this.messages.push(res)
        },
        error: (err) => console.error('Error en mensajes:', err)
      })
    );

  }

  async sendMessage(){
    if(this.newMessage !== ''){
      this.chatService.sendMessage(this.groupId, this.username, this.newMessage).then((res) => {
        this.messages.push(res)
        this.newMessage = '';
      }).catch((err) => {
        console.error("", err);
      })

    }
  }
}
