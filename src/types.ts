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
