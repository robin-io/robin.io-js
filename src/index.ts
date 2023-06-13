import axios from 'axios'
import WS from 'isomorphic-ws'

export interface MetadataFilter {
  metadata_key?: string;
  metadata_value?: object;
}

export interface UserToken {
  user_token?: string;
  meta_data?: object;
  support_name?: string;
  support_id?: string;
}

export interface Conversation {
  sender_name: string;
  sender_token?: string;
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
  reply_to?: string;
  is_reply?: boolean;
  local_id?: string;
}

export class Robin {
  apiKey: string;
  tls?: boolean | false;
  baseUrl: string;
  wsUrl: string;
  env?: string | 'production'

  retries: number;
  isConnected!: boolean;
  sessionToken: string | undefined;

  // tls? : deprecated will always connect via https
  constructor(apiKey: string, tls?: boolean, retries?: number, env?: string, sessionToken?: string) {
    this.apiKey = apiKey
    this.tls = tls === undefined ? true : tls
    this.retries = retries === undefined ? 0 : retries
    this.isConnected = false
    this.env = env === undefined ? 'production' : env
    this.sessionToken = sessionToken === undefined ? '' : sessionToken

    axios.defaults.headers.common['x-api-key'] = this.apiKey

    if (this.sessionToken != '') {
      axios.defaults.headers.common['x-robin-session'] = this.sessionToken
    }

    let url, wsurl

    switch (this.env) {
      case 'production':
        url = 'api.robinapp.io/api/v1'
        wsurl = 'api.robinapp.io/ws'
        break
      case 'dev':
        url = 'dev.robinapp.io/api/v1'
        wsurl = 'dev.robinapp.io/ws'
        break
      default:
        url = 'api.robinapp.io/api/v1'
        wsurl = 'api.robinapp.io/ws'
        break
    }

    if (tls) {
      this.baseUrl = `https://${url}`
      this.wsUrl = `wss://${wsurl}`
    } else {
      this.baseUrl = `http://${url}`
      this.wsUrl = `ws://${wsurl}`
    }
  }

  async GetSession(userToken: string) {
    try {
      let data = {
        user_token: userToken
      }
      const response = await axios.post(this.baseUrl + '/session/get/auth', data)

      if (response.data.error) {
        throw new Error(response.data.error)
      }

      axios.defaults.headers.common['x-robin-session'] = response.data.token

      this.sessionToken = response.data.token

      return response.data.token

    } catch (error) {
      throw error
    }
  }

  async createUserToken(data: UserToken) {
    try {
      const response = await axios.post(this.baseUrl + '/chat/user_token', data)
      if (response.data.error) {
        return undefined
      }
      return response.data.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async createSupportStaff(data: UserToken) {
    try {
      const response = await axios.post(this.baseUrl + '/chat/user_token/support', data)
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getSupportStaff(data: UserToken) {
    try {
      const response = await axios.get(this.baseUrl + '/chat/user_token/support/' + data.support_name)
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getUserToken(limit: number, page: number) {
    try {
      const response = await axios.get(
        this.baseUrl + `/chat/user_token?limit=${limit}&page=${page}`
      )

      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getUserTokens(
    limit: number,
    page: number,
    username_query?: string,
    user_tokens_filter?: string[],
    filter_by_metadata?: MetadataFilter
  ) {
    try {
      const response = await axios.post(
        this.baseUrl + `/chat/user_token/get?limit=${limit}&page=${page}`, {
        username_starts_with: username_query || '',
        user_tokens_filter: user_tokens_filter || [],
        meta_data_key_filter: filter_by_metadata?.metadata_key || '',
        meta_data_value_filter: filter_by_metadata?.metadata_value || ''
      }
      )

      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async syncUserToken(data: UserToken) {
    try {
      const response = await axios.put(
        this.baseUrl + '/chat/user_token',
        data
      )
      if (response.data.error) {
        return undefined
      }
      return response.data.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async createConversation(data: Conversation) {
    try {
      const response = await axios.post(this.baseUrl + '/chat/conversation', data)

      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getConversationMessages(id: string, limit: number, page: number) {
    try {
      const response = await axios.get(
        this.baseUrl + `/chat/conversation/messages/${id}?limit=${limit}&page=${page}`
      )
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getConversationMessagesByTimestamp(id: string, start: Date, end: Date) {
    try {
      const response = await axios.post(
        this.baseUrl + `/chat/conversation/message/timestamp/${id}`,
        {
          start: start,
          end: end
        }
      )
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async searchConversation(id: string, text: string, limit: number, page: number) {
    try {
      const response = await axios.post(
        this.baseUrl + `/chat/search/message/${id}?limit=${limit}&page=${page}`,
        {
          text: text
        }
      )

      if (response.data.error) {
        return undefined
      }
      return response.data.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async deleteMessages(ids: string[]) {
    try {
      const body = {
        ids: ids,
      }
      const response = await axios.delete(this.baseUrl + '/chat/message/', { data: body })
      if (response.data.error) {
        return undefined
      }
      return response.data.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async deleteAllMessages(conversation_id: string) {
    try {
      const response = await axios.delete(this.baseUrl + `/chat/conversation/delete/messages/${conversation_id}`)
      if (response.data.error) {
        return undefined
      }
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async createGroupConversation(
    name: string,
    participants: UserToken[]
  ) {
    try {
      const response = await axios.post(
        this.baseUrl + '/chat/conversation/group',
        {
          name,
          participants
        }
      )
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async assignGroupModerator(id: string, userToken: string) {
    try {
      const response = await axios.put(
        this.baseUrl + '/chat/conversation/group/assign_moderator/' + id,
        {
          user_token: userToken
        }
      )
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async addGroupParticipants(id: string, participants: UserToken[]) {
    try {
      const response = await axios.put(
        this.baseUrl + '/chat/conversation/group/add_participants/' + id,
        {
          participants
        }
      )
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async removeGroupParticipant(id: string, userToken: string) {
    try {
      const response = await axios.put(
        this.baseUrl + '/chat/conversation/group/remove_participant/' + id,
        {
          user_token: userToken
        }
      )
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async archiveConversation(id: string) {
    try {
      const response = await axios.put(
        this.baseUrl + `/chat/conversation/archive/${id}`
      )

      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getArchivedConversation(limit: number, page: number) {
    try {
      const response = await axios.get(
        this.baseUrl + `/chat/conversation/archived?page=${page}&limit=${limit}`
      )

      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async unarchiveConversation(id: string) {
    try {
      const response = await axios.put(
        this.baseUrl + `/chat/conversation/unarchive/${id}`
      )

      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async forwardMessages(message_ids: string[], conversation_ids: string[], senderName?: string) {
    try {
      if (message_ids.length === 0 || conversation_ids.length === 0) {
        return
      }
      const response = await axios.post(
        this.baseUrl + '/chat/conversation/forward_messages',
        {
          message_ids: message_ids,
          conversation_ids: conversation_ids,
          sender_name: senderName
        }
      )

      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  connect(max_retries?: number): WebSocket {
    const conn = new WS(`${this.wsUrl}?auth=${this.sessionToken}`)

    conn.onopen = function () {
      this.isConnected = true
    }

    conn.onclose = function () {
      console.log('closed')
      max_retries = max_retries === undefined ? 5 : max_retries

      while (this.retries < max_retries) {
        this.connect(5)
      }
    }

    return conn
  }

  // subscribe to channel
  subscribe(msg: string, conn: WebSocket) {
    conn.send(msg)
  }

  // send message to conversation

  sendMessageToConversation(message: string, conn: WebSocket) {
    conn.send(message)
  }

  replyToMessage(message: string, conn: WebSocket) {
    conn.send(message)
  }

  async reactToMessage(reaction: string, conversation_id: string, message_id: string, sender_token: string) {
    try {
      const response = await axios.post(this.baseUrl + `/chat/message/reaction/${message_id}`, {
        user_token: sender_token,
        reaction: reaction,
        conversation_id: conversation_id,
        timestamp: (new Date())
      })
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async RemoveReaction(reaction_id: string, message_id: string) {
    try {
      const response = await axios.delete(this.baseUrl + `/chat/message/reaction/delete/${reaction_id}/${message_id}`, {})
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async sendMessageAttachment(conversation_id: string, file: File, senderName?: string, msg?: string, localID?: string, isVoiceNote?: boolean) {
    const fd = new FormData()

    fd.append('sender_name', senderName!)
    fd.append('conversation_id', conversation_id)
    fd.append('msg', msg!)
    fd.append('file', file)
    fd.append('local_id', localID!)
    fd.append('is_voice_note', `${isVoiceNote ?? false}`)

    try {
      const response = await axios.post(
        this.baseUrl + '/chat/message/send/attachment/',
        fd
      )
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async replyMessageWithAttachment(conversation_id: string, message_id: string, file: File, senderName?: string, msg?: string, localID?: string) {
    const fd = new FormData()

    fd.append('sender_name', senderName!)
    fd.append('conversation_id', conversation_id)
    fd.append('message_id', message_id)
    fd.append('msg', msg!)
    fd.append('file', file)
    fd.append('local_id', localID!)

    try {
      const response = await axios.post(
        this.baseUrl + '/chat/message/send/attachment/reply/',
        fd
      )
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  // support

  createSupportTicket(msg: object, conn: WebSocket, channel: string, support_name: string, sender_token: string, sender_name: string) {
    const message: Message = {
      type: 1,
      channel: channel,
      content: msg,
      support_name: support_name,
      sender_token: sender_token,
      sender_name: sender_name
    }

    conn.send(JSON.stringify(message))
  }

  async getUnassignedUsers(support_name: string) {
    try {
      const response = await axios.get(
        this.baseUrl + '/chat/support/unassigned/' + support_name
      )
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async sendReadReceipts(message_ids: string[], conversation_id: string) {
    try {
      const response = await axios.post(this.baseUrl + '/chat/message/read/receipt', {
        message_ids: message_ids,
        conversation_id: conversation_id,
      })
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async starMessage(message_id: string) {
    try {
      const response = await axios.post(this.baseUrl + '/chat/message/star' + message_id)
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getStarredMessages() {
    try {
      const response = await axios.get(this.baseUrl + '/chat/message/star')
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getUnreadConversations() {
    try {
      const response = await axios.get(this.baseUrl + '/chat/conversation/unread')
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async deleteConversation(conversation_id: string) {
    try {
      const response = await axios.delete(this.baseUrl + `/chat/conversation/delete/${conversation_id}`)
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getConversationDetails(conversation_id: string) {
    try {
      const response = await axios.get(this.baseUrl + `/chat/conversation/details/${conversation_id}`)
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async uploadGroupIcon(conversation_id: string, file: File) {
    const fd = new FormData()

    fd.append('file', file)

    try {
      const response = await axios.post(
        this.baseUrl + '/chat/conversation/group/upload/media/' + conversation_id,
        fd
      )
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async uploadDisplayPhoto(photo: string) {
    const fd = new FormData()

    fd.append('display_photo', photo)

    try {
      const response = await axios.put(this.baseUrl + '/chat/user_token/display_photo', fd)
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }
}
