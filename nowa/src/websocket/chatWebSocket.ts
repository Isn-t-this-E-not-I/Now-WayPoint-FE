import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

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
    stompClient.subscribe('/topic/messages', onMessageReceived, {
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
