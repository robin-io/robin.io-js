import axios from 'axios';
import { UserToken, Conversation, Message } from './types';
const WS = require('isomorphic-ws')

export class Robin {
  apiKey: string;
  tls?: boolean | false;
  baseUrl: string;
  wsUrl: string;

  retries!: number;
  isConnected: boolean = false;

  constructor(apiKey: string, tls?: boolean) {
    this.apiKey = apiKey;
    this.tls = tls;

    axios.defaults.headers.common['x-api-key'] = this.apiKey;

    if (tls) {
      this.baseUrl = 'https://robbin-api.herokuapp.com/api/v1';
      this.wsUrl = 'wss://robbin-api.herokuapp.com/ws';
    } else {
      this.baseUrl = 'http://robbin-api.herokuapp.com/api/v1';
      this.wsUrl = 'ws://robbin-api.herokuapp.com/ws';
    }
  }

  async createUserToken(data: UserToken) {
    try {
      let response = await axios.post(this.baseUrl + '/chat/user_token', data);
      return response.data;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async getUserToken(data: UserToken) {
    try {
      let response = await axios.get(
        this.baseUrl + '/chat/user_token/' + data.user_token
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async syncUserToken(data: UserToken) {
    try {
      let response = await axios.put(
        this.baseUrl + '/chat/user_token/' + data.user_token,
        data
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async createConversation(data: Conversation) {
    try {
      let response = await axios.post(this.baseUrl + '/conversation', data);
      return response.data;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async getConversationMessages(id: string) {
    try {
      let response = await axios.get(
        this.baseUrl + '/conversation/messages/' + id
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async searchConversation(id: string, text: string) {
    try {
      let response = await axios.post(
        this.baseUrl + '/chat/search/message/' + id,
        {
          text: text,
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async deleteMessages(id: string) {
    try {
      let response = await axios.delete(this.baseUrl + '/chat/message/' + id);
      return response.data;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async createGroupConversation(
    name: string,
    moderator: UserToken,
    participants: UserToken[]
  ) {
    try {
      let response = await axios.post(
        this.baseUrl + '/chat/conversation/group',
        {
          name,
          moderator,
          participants,
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async assignGroupModerator(id: string, userToken: string) {
    try {
      let response = await axios.put(
        this.baseUrl + '/chat/conversation/group/assign_moderator/' + id,
        {
          user_token: userToken,
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async addGroupParticipants(id: string, participants: UserToken[]) {
    try {
      let response = await axios.put(
        this.baseUrl + '/chat/conversation/group/add_participants/' + id,
        {
          participants,
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async removeGroupParticipant(id: string, userToken: string) {
    try {
      let response = await axios.put(
        this.baseUrl + '/chat/conversation/group/remove_participant/' + id,
        {
          user_token: userToken,
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  connect(user_token: string, max_retries?: number): WebSocket{
    const conn = new WS(`${this.wsUrl}/${this.apiKey}/${user_token}`)

    conn.onopen = function() {
      this.isConnected = true
    }

    conn.onclose = function() {
      max_retries = max_retries == undefined ? 5 : max_retries

      while(this.retries < max_retries) {
        this.connect(user_token, 5)
      }
    }

    return conn
  }

  // subscribe to channel
  subscribe(channel: string, conn: WebSocket) {
    let msg :Message = {
      type: 0,
      channel:  channel,
      content: {},
      conversation_id: ""
    }
    conn.send(JSON.stringify(msg))
    return
  }

  // send message to conversation

  sendMessageToConversation(msg: object, conn: WebSocket, channel:string,conversation_id: string) {

    let message :Message = {
      type: 1,
      channel: channel,
      content: msg,
      conversation_id: conversation_id
    }

    conn.send(JSON.stringify(message))

  }

  // support

  createSupportTicket(msg: object, conn: WebSocket, channel: string, support_name: string, sender_token: string) {
    let message :Message = {
      type: 1,
      channel: channel,
      content: msg,
      support_name: support_name,
      sender_token: sender_token,
    }

    conn.send(JSON.stringify(message))
  }

}
