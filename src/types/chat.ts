export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  reasoning?: string;
}

export interface ChatResponse {
  answer: string;
  reasoning?: string;
}
