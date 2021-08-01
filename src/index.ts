import axios from 'axios';
import { UserToken, Conversation } from './types';

export class Robin {
  apiKey: string;
  tls?: boolean | false;
  baseUrl: string;

  constructor(apiKey: string, tls?: boolean) {
    this.apiKey = apiKey;
    this.tls = tls;

    axios.defaults.headers.common['x-api-key'] = this.apiKey;

    if (tls) {
      this.baseUrl = 'https://robbin-api.herokuapp.com/api/v1';
    } else {
      this.baseUrl = 'http://robbin-api.herokuapp.com/api/v1';
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

  async getConversation(id: string) {
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
}
