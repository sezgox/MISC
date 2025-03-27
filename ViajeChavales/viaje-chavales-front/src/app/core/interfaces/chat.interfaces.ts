export interface ChatMessage {
  userId: string;
  chatId: string;
  message: string;
  info: ChatMessageInfo;
}
export interface ChatMessageInfo {
  date: Date;
}
