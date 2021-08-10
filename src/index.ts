import axios from 'axios';
import { UserToken, Conversation, Channel, Message, Queue } from './types';
const WS = require('isomorphic-ws');

export class Robin {
  apiKey: string;
  tls?: boolean | false;
  baseUrl: string;
  ws: string;
  retries: number;
  private connected: boolean;
  private queue: Queue[];
  private subscriptions: string[];
  private isReconnecting: boolean;
  private _reconnectTimeout: any;

  constructor(apiKey: string, tls?: boolean, retries?: number) {
    this.apiKey = apiKey;
    this.tls = tls;
    this.connected = false;
    this.queue = [];
    this.subscriptions = [];
    this.isReconnecting = false;
    this.retries = retries === undefined ? 0 : retries;

    axios.defaults.headers.common['x-api-key'] = this.apiKey;

    if (tls) {
      this.baseUrl = 'https://robbin-api.herokuapp.com/api/v1';
      this.ws = 'wss://robbin-api.herokuapp.com/ws';
    } else {
      this.baseUrl = 'http://robbin-api.herokuapp.com/api/v1';
      this.ws = 'ws://robbin-api.herokuapp.com/ws';
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

  async createChannel(name: string) {
    const private_name = name.replace(/\s+/g, '') + '-' + this.apiKey;
    const channel: Channel = {
      name,
      private_name,
    };

    return channel;
  }

  reconnect(userToken: string) {
    // if connection is reconnecting, do nothing
    if (this.isReconnecting || this.connected) {
      return;
    }

    // set timeout
    this.isReconnecting = true;
    this._reconnectTimeout = setTimeout(() => {
      console.log('Reconnecting....');
      this.connectWebSocket(userToken);
    }, 2000);
    return;
  }

  connectWebSocket(userToken: string, maxRetries?: number): WebSocket {
    const conn = new WS(this.ws + '/' + this.apiKey + '/' + userToken);

    // clear timeout of reconnect
    if (this._reconnectTimeout) {
      clearTimeout(this._reconnectTimeout);
    }

    conn.onopen = () => {
      // change state of connected
      this.connected = true;
      this.isReconnecting = false;
      this.runQueue(conn);
      this.runSubscriptionQueue(conn);
    };

    conn.onerror = () => {
      this.connected = false;
      this.isReconnecting = false;
      this.reconnect(userToken);
    };

    conn.onclose = () => {
      this.connected = false;
      this.isReconnecting = false;

      maxRetries = maxRetries === undefined ? 5 : maxRetries;
      if (this.retries < maxRetries) {
        this.reconnect(userToken);
        this.retries++;
      } else {
        // do nothing
      }
    };

    return conn;
  }

  subscribeToChannel(conn: WebSocket, channel: string) {
    if (this.connected && conn.readyState === 1) {
      const message: Message = {
        type: 0,
        channel: channel,
        content: null,
      };

      conn.send(JSON.stringify(message));
    } else {
      console.log('connection not ready');
    }

    // let store this into subscriptions for later when use reconnect and we need to run queue to subscribe again
    this.subscriptions.push(channel);
  }

  sendMessageToChannel(conn: WebSocket, channel: Channel, content: object) {
    if (this.connected && conn.readyState === 1) {
      const message: Message = {
        type: 1,
        channel: channel.private_name,
        content: content,
      };

      conn.send(JSON.stringify(message));
    } else {
      // let keep it in the queue if not connected;
      this.queue.push({
        channel,
        content,
        conversation_id: '',
        group: true,
      });
    }
  }

  sendMessageToConversation(
    conn: WebSocket,
    channel: Channel,
    conversationId: string,
    content: object
  ) {
    if (this.connected && conn.readyState === 1) {
      const message: Message = {
        type: 1,
        channel: channel.private_name,
        content: content,
        conversation_id: conversationId,
      };

      conn.send(JSON.stringify(message));
    } else {
      // let keep it in the queue if not connected;
      this.queue.push({
        channel,
        content,
        conversation_id: conversationId,
        group: false,
      });
    }
  }

  runQueue(conn: WebSocket) {
    if (this.queue.length > 0) {
      this.queue.forEach((q, index) => {
        if (q.group) {
          this.sendMessageToChannel(conn, q.channel, q.content);
        } else {
          this.sendMessageToConversation(
            conn,
            q.channel,
            q.conversation_id,
            q.content
          );
        }

        // remove queue
        delete this.queue[index];
      });
    }
  }

  runSubscriptionQueue(conn: WebSocket) {
    if (this.subscriptions.length > 0) {
      this.subscriptions.forEach(subscription => {
        this.subscribeToChannel(conn, subscription);
      });
    }
  }
}
