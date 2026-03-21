export interface ChatMessage {
  id?: number;
  userId: string;
  chatId: string;
  message: string;
  date?: string | Date;
}
