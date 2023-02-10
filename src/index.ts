import axios from 'axios'
import WS from 'isomorphic-ws'

export interface UserToken {
  user_token?: string;
  meta_data?: object;
  support_name?: string;
  support_id?: string;
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

  // tls? : deprecated will always connect via https
  constructor (apiKey: string, tls?: boolean, retries?: number, env?: string) {
    this.apiKey = apiKey
    this.tls = tls === undefined ? true : tls
    this.retries = retries === undefined ? 0 : retries
    this.isConnected = false
    this.env = env === undefined ? 'production' : env

    axios.defaults.headers.common['x-api-key'] = this.apiKey

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

  async createUserToken (data: UserToken) {
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

  async createSupportStaff (data: UserToken) {
    try {
      const response = await axios.post(this.baseUrl + '/chat/user_token/support', data)
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getSupportStaff (data: UserToken) {
    try {
      const response = await axios.get(this.baseUrl + '/chat/user_token/support/' + data.support_name)
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getUserToken (data: UserToken, limit: number, page: number) {
    try {
      const response = await axios.get(
        this.baseUrl + `/chat/user_token/${data.user_token}?limit=${limit}&page=${page}`
      )

      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async syncUserToken (data: UserToken) {
    try {
      const response = await axios.put(
        this.baseUrl + '/chat/user_token/' + data.user_token,
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

  async createConversation (data: Conversation) {
    try {
      const response = await axios.post(this.baseUrl + '/chat/conversation', data)

      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getConversationMessages (id: string, userToken: string, limit: number, page: number) {
    try {
      const response = await axios.get(
        this.baseUrl + `/chat/conversation/messages/${id}/${userToken}?limit=${limit}&page=${page}`
      )
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getConversationMessagesByTimestamp (id: string, userToken: string, start: Date, end: Date) {
    try {
      const response = await axios.post(
        this.baseUrl + `/chat/conversation/message/timestamp/${id}`,
        {
          user_token: userToken,
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

  async searchConversation (id: string, text: string, limit: number, page: number) {
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

  async deleteMessages (ids: string[], requesterToken: string) {
    try {
      const body = {
        ids: ids,
        requester_token: requesterToken
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

  async deleteAllMessages (conversation_id: string, requesterToken: string) {
    try {
      const response = await axios.delete(this.baseUrl + `/chat/conversation/delete/messages/${conversation_id}/${requesterToken}`)
      if (response.data.error) {
        return undefined
      }
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async createGroupConversation (
    name: string,
    moderator: UserToken,
    participants: UserToken[]
  ) {
    try {
      const response = await axios.post(
        this.baseUrl + '/chat/conversation/group',
        {
          name,
          moderator,
          participants
        }
      )
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async assignGroupModerator (id: string, userToken: string) {
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

  async addGroupParticipants (id: string, participants: UserToken[]) {
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

  async removeGroupParticipant (id: string, userToken: string) {
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

  async archiveConversation (id: string, userToken: string) {
    try {
      const response = await axios.put(
        this.baseUrl + `/chat/conversation/archive/${id}/${userToken}`
      )

      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getArchivedConversation (data: UserToken, limit: number, page: number) {
    try {
      const response = await axios.get(
        this.baseUrl + `/chat/conversation/archived/${data.user_token}?page=${page}&limit=${limit}`
      )

      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async unarchiveConversation (id: string, userToken: string) {
    try {
      const response = await axios.put(
        this.baseUrl + `/chat/conversation/unarchive/${id}/${userToken}`
      )

      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async forwardMessages (user_token: string, message_ids: string[], conversation_ids: string[], senderName?: string) {
    try {
      if (user_token.length === 0 || message_ids.length === 0 || conversation_ids.length === 0) {
        return
      }
      const response = await axios.post(
        this.baseUrl + '/chat/conversation/forward_messages',
        {
          user_token: user_token,
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

  connect (user_token: string, max_retries?: number): WebSocket {
    const conn = new WS(`${this.wsUrl}/${this.apiKey}/${user_token}`)

    conn.onopen = function () {
      this.isConnected = true
    }

    conn.onclose = function () {
      console.log('closed')
      max_retries = max_retries === undefined ? 5 : max_retries

      while (this.retries < max_retries) {
        this.connect(user_token, 5)
      }
    }

    return conn
  }

  // subscribe to channel
  subscribe (msg: string, conn: WebSocket) {
    conn.send(msg)
  }

  // send message to conversation

  sendMessageToConversation (message: string, conn: WebSocket) {
    conn.send(message)
  }

  replyToMessage (message: string, conn: WebSocket) {
    conn.send(message)
  }

  async reactToMessage (reaction: string, conversation_id: string, message_id: string, sender_token: string) {
    try {
      const response = await axios.post(this.baseUrl + `/chat/message/reaction/${message_id}/${sender_token}`, {
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

  async RemoveReaction (reaction_id: string, message_id: string) {
    try {
      const response = await axios.delete(this.baseUrl + `/chat/message/reaction/delete/${reaction_id}/${message_id}`, {})
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async sendMessageAttachment (user_token: string, conversation_id: string, file: File, senderName?: string, msg?: string, localID?: string) {
    const fd = new FormData()

    fd.append('sender_token', user_token)
    fd.append('sender_name', senderName!)
    fd.append('conversation_id', conversation_id)
    fd.append('msg', msg!)
    fd.append('file', file)
    fd.append('local_id', localID!)

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

  async replyMessageWithAttachment (user_token: string, conversation_id: string, message_id: string, file: File, senderName?: string, msg?: string, localID?: string) {
    const fd = new FormData()

    fd.append('sender_token', user_token)
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

  createSupportTicket (msg: object, conn: WebSocket, channel: string, support_name: string, sender_token: string, sender_name: string) {
    const message :Message = {
      type: 1,
      channel: channel,
      content: msg,
      support_name: support_name,
      sender_token: sender_token,
      sender_name: sender_name
    }

    conn.send(JSON.stringify(message))
  }

  async getUnassignedUsers (support_name: string) {
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

  async sendReadReceipts (message_ids: string[], conversation_id: string, user_token: string) {
    try {
      const response = await axios.post(this.baseUrl + '/chat/message/read/receipt', {
        message_ids: message_ids,
        conversation_id: conversation_id,
        user_token: user_token
      })
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async starMessage (message_id: string, user_token: string) {
    try {
      const response = await axios.post(this.baseUrl + '/chat/message/' + message_id, {
        user_token: user_token
      })
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getStarredMessages (user_token: string) {
    try {
      const response = await axios.get(this.baseUrl + '/chat/message/' + user_token)
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async deleteConversation (user_token: string, conversation_id: string) {
    try {
      const response = await axios.delete(this.baseUrl + `/chat/conversation/delete/${conversation_id}/${user_token}`)
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async getConversationDetails (conversation_id: string, user_token: string) {
    try {
      const response = await axios.get(this.baseUrl + `/chat/conversation/details/${conversation_id}/${user_token}`)
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  async uploadGroupIcon (conversation_id: string, file: File) {
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

  async uploadDisplayPhoto (user_token: string, photo: string) {
    const fd = new FormData()

    fd.append('display_photo', photo)

    try {
      const response = await axios.put(this.baseUrl + '/chat/user_token/display_photo/' + user_token, fd)
      return response.data
    } catch (error) {
      console.log(error)
      return undefined
    }
  }
}
