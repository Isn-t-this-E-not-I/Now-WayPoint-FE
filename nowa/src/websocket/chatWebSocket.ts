import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ChatRoom } from '../types'

const SOCKET_URL = 'http://localhost:8080/ws' // 웹소켓 서버 URL

let stompClient: Client | null = null

export const connect = (
  token: string,
  onMessageReceived: (message: IMessage) => void,
  onConnected: () => void
) => {
  const socket = new SockJS(SOCKET_URL)
  stompClient = new Client({
    webSocketFactory: () => socket,
    debug: (str) => {
      console.log(str)
    },
    onConnect: onConnected,
    onStompError: (frame) => {
      console.error(frame)
    },
  })

  stompClient.onWebSocketClose = () => {
    console.log('WebSocket closed')
  }

  stompClient.activate()

  if (stompClient) {
    stompClient.subscribe('/queue/chatroom/' + token, onMessageReceived, {
      Authorization: `Bearer ${token}`,
    })
  }
}

export const disconnect = () => {
  if (stompClient) {
    stompClient.deactivate()
  }
}

export const sendMessage = (
  token: string,
  chatRoomId: number,
  message: string
) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/chat/${chatRoomId}/sendMessage`,
      body: JSON.stringify({ message }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }
}

export const enterChatRoom = (
  token: string,
  chatRoomId: number,
  onMessageReceived: (message: IMessage) => void
) => {
  if (stompClient && stompClient.connected) {
    stompClient.subscribe(`/topic/chatroom/${chatRoomId}`, onMessageReceived, {
      Authorization: `Bearer ${token}`,
    })
  }
}

export const createChatRoom = (token: string, nicknames: string[]) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/chatRoom/create`,
      body: JSON.stringify({ nicknames }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }
}

export const createDuplicateChatRoom = (token: string, nicknames: string[]) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/chatRoom/createDuplicate`,
      body: JSON.stringify({ nicknames }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }
}

export const updateChatRoomName = (
  token: string,
  chatRoomId: number,
  newChatRoomName: string
) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/chatRoom/${chatRoomId}/nameUpdate`,
      body: JSON.stringify({ newChatRoomName }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }
}

export const inviteToChatRoom = (
  token: string,
  chatRoomId: number,
  nicknames: string[]
) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/chatRoom/${chatRoomId}/invite`,
      body: JSON.stringify({ nicknames }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }
}

export const leaveChatRoom = (token: string, chatRoomId: number) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/chatRoom/${chatRoomId}/leave`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }
}

export const fetchChatMessages = (
  token: string,
  chatRoomId: number,
  count: number
) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/chatRoom/${chatRoomId}/messages`,
      body: JSON.stringify({ count }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }
}

export const getMessagesBefore = (
  token: string,
  chatRoomId: number,
  timestamp: string
) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/chat/messages/before`,
      body: JSON.stringify({ chatRoomId, timestamp }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }
}

export const getChatRoomUpdate = (
  token: string,
  chatRoomId: number
): Promise<ChatRoom> => {
  return new Promise((resolve, reject) => {
    if (stompClient && stompClient.connected) {
      const onMessageReceived = (message: IMessage) => {
        resolve(JSON.parse(message.body))
      }

      stompClient.subscribe(
        `/queue/chatroom/${chatRoomId}/update`,
        onMessageReceived,
        {
          Authorization: `Bearer ${token}`,
        }
      )
    } else {
      reject('WebSocket is not connected')
    }
  })
}
