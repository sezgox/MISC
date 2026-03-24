import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { GroupChatMessages } from '../../../core/interfaces/chat.interfaces';
import { UserGroupMembership } from '../../../core/interfaces/user.interface';
import { ActiveGroupService } from '../../../core/services/active-group.service';
import { ChatService } from '../../../core/services/chat.service';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, MatFormFieldModule, MatInputModule, MatSelectModule],
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
  public activeView: 'list' | 'chat' = 'list';

  public chatGroups: UserGroupMembership[] = [];
  public selectedGroupId: string | null = null;
  public messages = this.emptyMessagesState();
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;
  private forceScrollToBottomOnNextRender = false;

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
    this.chatService.disconnect();
  }

  async ngOnInit(): Promise<void> {
    this.username = this.resolveUsername();

    await this.syncChatGroups();
    if (!this.isAvailable || !this.selectedGroupId) {
      return;
    }

    if (!this.username) {
      try {
        const user = await this.userService.getCurrentUser(this.selectedGroupId);
        this.username = user.username;
      } catch {
        // Keep chat visible even if username fetch fails; send button will no-op until resolved.
      }
    }

    this.chatService.initializeSocket();
    this.joinAvailableGroups();

    this.subs.push(
      this.chatService.connectionState.subscribe((connected) => {
        this.isConnected = connected;
        if (connected) {
          this.joinAvailableGroups();
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
    this.activeView = 'chat';
    this.refreshMessagesState();
    this.joinSelectedGroup();
  }

  openChat(groupId: string) {
    this.selectedGroupId = groupId;
    this.activeView = 'chat';
    this.forceScrollToBottomOnNextRender = true;
    this.refreshMessagesState();
    this.joinSelectedGroup();
  }

  backToChatList() {
    this.activeView = 'list';
  }

  toggleChat() {
    this.chatOpen = !this.chatOpen;
    if (this.chatOpen && this.activeView === 'chat') {
      this.forceScrollToBottomOnNextRender = true;
      this.syncScrollPosition(true);
    }
  }

  onMessagesScroll() {
    // Intentionally left for template hook; we read position on demand before refresh.
  }

  async sendMessage() {
    const normalized = this.newMessage.trim();
    if (!normalized || !this.selectedGroupId) {
      return;
    }
    if (!this.username) {
      await this.tryResolveUsernameFromApi();
    }
    if (!this.username) {
      console.error('No se pudo resolver username para enviar mensaje');
      return;
    }

    this.chatService
      .sendMessage(this.selectedGroupId, this.username, normalized)
      .then(() => {
        this.refreshMessagesState();
        this.newMessage = '';
      })
      .catch((err) => {
        console.error('Error enviando mensaje:', err);
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
    this.activeView = 'list';
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

  private joinAvailableGroups() {
    if (!this.chatGroups.length) {
      return;
    }
    this.chatService.joinChats(this.chatGroups.map((group) => group.groupId));
  }

  private joinSelectedGroup() {
    if (!this.selectedGroupId) {
      return;
    }

    this.chatService.joinChat(this.selectedGroupId);
  }

  private refreshMessagesState() {
    const shouldStickToBottom = this.shouldStickToBottom();
    this.messages = this.chatService.getChatsSnapshot();
    this.syncScrollPosition(shouldStickToBottom);
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

  get selectedGroupName() {
    if (!this.selectedGroupId) {
      return '';
    }
    return this.chatGroups.find((group) => group.groupId === this.selectedGroupId)?.groupName ?? '';
  }

  get chatSummaries() {
    return this.chatGroups.map((group) => {
      const groupMessages = this.messages.find((chat) => chat.groupId === group.groupId)?.messages ?? [];
      const lastMessage = groupMessages[groupMessages.length - 1];
      return {
        groupId: group.groupId,
        groupName: group.groupName,
        totalMessages: groupMessages.length,
        lastMessageText: lastMessage?.message ?? 'Sin mensajes todavía',
        lastMessageDate: lastMessage?.date,
      };
    });
  }

  private resolveUsername(): string {
    const storedUsername = this.userService.getUsername();
    if (storedUsername) {
      return storedUsername;
    }

    const token = this.userService.getAccessToken();
    if (!token) {
      return '';
    }

    try {
      if (typeof atob !== 'function') {
        return '';
      }
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return '';
      }
      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const payloadJson = atob(padded);
      const payload = JSON.parse(payloadJson) as { sub?: string };
      return payload.sub ?? '';
    } catch {
      return '';
    }
  }

  private async tryResolveUsernameFromApi() {
    if (!this.selectedGroupId) {
      return;
    }
    try {
      const user = await this.userService.getCurrentUser(this.selectedGroupId);
      this.username = user.username;
    } catch {
      // Keep silent; caller handles guard.
    }
  }

  private shouldStickToBottom(): boolean {
    if (!this.chatOpen || this.activeView !== 'chat') {
      return false;
    }

    if (this.forceScrollToBottomOnNextRender) {
      this.forceScrollToBottomOnNextRender = false;
      return true;
    }

    return this.isNearBottom();
  }

  private isNearBottom(): boolean {
    const container = this.messagesContainer?.nativeElement;
    if (!container) {
      return true;
    }

    const distanceToBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);
    return distanceToBottom <= 24;
  }

  private syncScrollPosition(stickToBottom: boolean) {
    if (!stickToBottom) {
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const container = this.messagesContainer?.nativeElement;
        if (!container) {
          return;
        }
        container.scrollTop = container.scrollHeight;
      });
    });
  }

}
