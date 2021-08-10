import axios from 'axios';
import { UserToken, Conversation, Channel, Message, Queue } from './types';

export class Robin {
  apiKey: string;
  tls?: boolean | false;
  baseUrl: string;
  ws: string;
  conn: any;
  private connected: boolean;
  private queue: Queue[];
  private subscriptions: Channel[];
  private isReconnecting: boolean;
  private _reconnectTimeout: any;

  constructor(apiKey: string, tls?: boolean) {
    this.apiKey = apiKey;
    this.tls = tls;
    this.connected = false;
    this.queue = [];
    this.subscriptions = [];
    this.isReconnecting = false;

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
    try {
      if (name.length === 0) {
        console.log()
      }
  
      const private_name = name.replace(/\s+/g, '') + '-' + this.apiKey;
      console.log(private_name);
      const channel: Channel = {
        name,
        private_name,
      };

      return channel;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async reconnect(userToken: string) {
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

  async connectWebSocket(userToken: string) {
    try {
      const ws = new WebSocket(this.ws + '/' + this.apiKey + '/' + userToken);
      this.conn = ws;

      // clear timeout of reconnect
      if (this._reconnectTimeout) {
        clearTimeout(this._reconnectTimeout);
      }

      ws.onopen = async () => {
        // change state of connected
        this.connected = true;
        this.isReconnecting = false;

        console.log('connected to the server');
        await this.runQueue();
        await this.runSubscriptionQueue();
      };

      ws.onerror = err => {
        console.log('unable connect to the server', err);
        this.connected = false;
        this.isReconnecting = false;
        this.reconnect(userToken);
      };

      ws.onclose = async () => {
        console.log('Connection is closed');
        this.connected = false;
        this.isReconnecting = false;
        await this.reconnect(userToken);
      };

      return ws;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async subscribeToChannel(channel: Channel) {
    try {
      const message: Message = {
        type: 0,
        channel: channel.private_name,
        content: null,
      };

      const msg = JSON.stringify(message);

      this.conn.send(msg);

      // let store this into subscriptions for later when use reconnect and we need to run queue to subscribe again
      this.subscriptions.push(channel);

      return undefined;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async sendMessageToChannel(channel: Channel, content: object) {
    try {
      if (this.connected && this.conn.readyState === 1) {
        const message : Message = {
          type: 1,
          channel: channel.private_name,
          content: content,
        };

        const msg = JSON.stringify(message);
        this.conn.send(msg);
      } else {
        // let keep it in the queue if not connected;
        this.queue.push({
          channel,
          content,
          conversation_id: '',
          group: true,
        });
      }
      return undefined;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async sendMessageToConversation(channel: Channel, conversationId: string, content: object) {
    try {
      if(this.connected && this.conn.readyState == 1) {
        const message : Message = {
          type: 1,
          channel: channel.private_name,
          content: content,
          conversation_id: conversationId,
        };

        const msg = JSON.stringify(message);
        this.conn.send(msg);
      } else {
        // let keep it in the queue if not connected;
        this.queue.push({
          channel,
          content,
          conversation_id: conversationId,
          group: false,
        });
      }
      return undefined;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async runQueue () {
    if (this.queue.length > 0) {
      this.queue.forEach(async (q, index) => {

        if (q.group) {
          await this.sendMessageToChannel(q.channel, q.content)
        } else {
          await this.sendMessageToConversation(q.channel, q.conversation_id, q.content);
        }

        // remove queue
        delete this.queue[index];
      });
    }
  }

  async runSubscriptionQueue () {
    if (this.subscriptions.length > 0) {
      this.subscriptions.forEach(async (subscription) => {
        await this.subscribeToChannel(subscription);
      })
    }
  }

}
