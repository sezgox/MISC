export interface ChatMessage {
  id?: number;
  userId: string;
  groupId: string;
  chatId?: string;
  message: string;
  date?: string | Date;
}

export interface GroupChatMessages {
  groupId: string;
  messages: ChatMessage[];
}
