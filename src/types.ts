export interface UserToken {
  user_token?: string;
  meta_data?: object;
}

export interface Conversation {
  sender_name: string;
  sender_token: string;
  receiver_token: string;
  receiver_name: string;
}

export interface Message {
  type: number;
  content: object;
  conversation_id?: string;
  channel: string;
  support_name?: string;
  sender_token?: string;
  sender_name?: string;
}