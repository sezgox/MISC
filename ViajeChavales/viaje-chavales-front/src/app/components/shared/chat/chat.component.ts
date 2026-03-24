import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GroupChatMessages } from '../../../core/interfaces/chat.interfaces';
import { UserGroupMembership } from '../../../core/interfaces/user.interface';
import { ActiveGroupService } from '../../../core/services/active-group.service';
import { ChatService } from '../../../core/services/chat.service';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, OnDestroy {
  private readonly userService = inject(UsersService);
  private readonly activeGroupService = inject(ActiveGroupService);
  private readonly chatService = inject(ChatService);

  private username = '';
  private subs: Subscription[] = [];

  public chatOpen = false;
  public newMessage = '';
  public isConnected = false;
  public isAvailable = true;

  public chatGroups: UserGroupMembership[] = [];
  public selectedGroupId: string | null = null;
  public messages = this.emptyMessagesState();

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
    this.chatService.disconnect();
  }

  async ngOnInit(): Promise<void> {
    this.username = this.userService.getUsername();
    if (!this.username) {
      try {
        const user = await this.userService.getCurrentUser();
        this.username = user.username;
      } catch {
        this.isAvailable = false;
        return;
      }
    }

    await this.syncChatGroups();
    if (!this.isAvailable || !this.selectedGroupId) {
      return;
    }

    this.chatService.initializeSocket();
    this.joinSelectedGroup();

    this.subs.push(
      this.chatService.connectionState.subscribe((connected) => {
        this.isConnected = connected;
        if (connected) {
          this.joinSelectedGroup();
        }
      }),
    );

    this.subs.push(
      this.activeGroupService.changed$.subscribe(() => {
        this.ensureSelectedGroupStillAvailable();
      }),
    );

    this.subs.push(
      this.chatService.onNewMessage().subscribe({
        next: () => {
          this.refreshMessagesState();
        },
        error: (err) => console.error('Error en mensajes:', err),
      }),
    );

    this.subs.push(
      this.chatService.initChat().subscribe({
        next: () => {
          this.refreshMessagesState();
        },
        error: (err) => console.error('Error al cargar mensajes iniciales:', err),
      }),
    );
  }

  async onChatGroupChange(groupId: string) {
    if (!groupId) {
      return;
    }

    this.selectedGroupId = groupId;
    this.refreshMessagesState();
    this.joinSelectedGroup();
  }

  async sendMessage() {
    const normalized = this.newMessage.trim();
    if (!normalized || !this.selectedGroupId) {
      return;
    }

    this.chatService
      .sendMessage(this.selectedGroupId, this.username, normalized)
      .then(() => {
        this.refreshMessagesState();
        this.newMessage = '';
      })
      .catch((err) => {
        console.error('', err);
      });
  }

  private async syncChatGroups() {
    this.applyAvailableGroups(this.activeGroupService.groups());

    try {
      const groups = await this.userService.getUserGroups();
      this.activeGroupService.setGroups(groups);
    } catch {
      // Keep local group context if sync fails.
    }

    this.applyAvailableGroups(this.activeGroupService.groups());
  }

  private applyAvailableGroups(groups: UserGroupMembership[]) {
    this.chatGroups = groups.filter((group) => group.userRole !== 'Pending');
    this.isAvailable = this.chatGroups.length > 0;

    if (!this.isAvailable) {
      this.selectedGroupId = null;
      this.messages = this.emptyMessagesState();
      return;
    }

    const activeGroupId = this.activeGroupService.getActiveGroupId();
    const preferredGroupId =
      (activeGroupId && this.chatGroups.some((group) => group.groupId === activeGroupId)
        ? activeGroupId
        : null) ?? this.chatGroups[0].groupId;

    this.selectedGroupId = preferredGroupId;
    this.refreshMessagesState();
  }

  private ensureSelectedGroupStillAvailable() {
    if (!this.chatGroups.length) {
      return;
    }

    if (this.selectedGroupId && this.chatGroups.some((group) => group.groupId === this.selectedGroupId)) {
      return;
    }

    this.selectedGroupId = this.chatGroups[0].groupId;
    this.refreshMessagesState();
    this.joinSelectedGroup();
  }

  private joinSelectedGroup() {
    if (!this.selectedGroupId) {
      return;
    }

    this.chatService.joinChat(this.selectedGroupId);
  }

  private refreshMessagesState() {
    this.messages = this.chatService.getChatsSnapshot();
  }

  private emptyMessagesState(): GroupChatMessages[] {
    return [];
  }

  get currentMessages() {
    if (!this.selectedGroupId) {
      return [];
    }

    const selectedChat = this.messages.find((chat) => chat.groupId === this.selectedGroupId);
    return selectedChat?.messages ?? [];
  }

}
