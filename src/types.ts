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

export interface Channel {
  name: string;
  private_name: string;
}

export interface Message {
  type: number;
  channel: string;
  content: object | null;
  conversation_id?: string;
}

export interface Queue {
  channel: Channel;
  content: object;
  group: boolean;
  conversation_id: string;
}
