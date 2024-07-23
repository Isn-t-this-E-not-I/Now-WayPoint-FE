import { Client, IMessage, StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ChatRoom } from '../types'

const SOCKET_URL = 'http://localhost:8080/ws' // 웹소켓 서버 URL

let stompClient: Client | null = null
let isConnected = false

export const connect = (
  token: string,
  onMessageReceived: (message: IMessage) => void,
  onConnected: () => void,
  onError: (error: any) => void
): StompSubscription | void => {
  const socket = new SockJS(SOCKET_URL)
  stompClient = new Client({
    webSocketFactory: () => socket,
    debug: (str) => {
      console.log(str)
    },
    onConnect: () => {
      isConnected = true
      onConnected()
    },
    onStompError: (frame) => {
      console.error('Broker reported error: ' + frame.headers['message'])
      console.error('Additional details: ' + frame.body)
      onError(frame)
    },
  })

  stompClient.onWebSocketClose = () => {
    console.log('WebSocket closed')
    isConnected = false
  }

  stompClient.onWebSocketError = (error) => {
    console.error('WebSocket error:', error)
    isConnected = false
    onError(error)
  }

  stompClient.activate()

  if (stompClient) {
    return stompClient.subscribe(
      '/queue/chatroom/' + token,
      onMessageReceived,
      {
        Authorization: `Bearer ${token}`,
      }
    )
  } else {
    throw new Error('StompClient is not initialized')
  }
}

export const disconnect = () => {
  if (stompClient) {
    stompClient.deactivate()
    isConnected = false
  }
}

export const sendMessage = (
  token: string,
  chatRoomId: number,
  message: string
) => {
  if (stompClient && isConnected) {
    stompClient.publish({
      destination: `/app/chat/${chatRoomId}/sendMessage`,
      body: JSON.stringify({ message }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } else {
    console.error('StompClient is not connected')
  }
}

export const enterChatRoom = (
  token: string,
  chatRoomId: number,
  onMessageReceived: (message: IMessage) => void
): StompSubscription | void => {
  if (stompClient && isConnected) {
    return stompClient.subscribe(
      `/topic/chatroom/${chatRoomId}`,
      onMessageReceived,
      {
        Authorization: `Bearer ${token}`,
      }
    )
  } else {
    throw new Error('StompClient is not connected')
  }
}

export const createChatRoom = (
  token: string,
  nicknames: string[],
  onSuccess: () => void,
  onError: (error: any) => void
) => {
  if (stompClient && isConnected) {
    const subscription = stompClient.subscribe(
      `/user/queue/chatRoom/create`,
      (message) => {
        const response = JSON.parse(message.body)
        if (response.success) {
          onSuccess()
        } else {
          onError(response.error)
        }
        subscription.unsubscribe()
      },
      {
        Authorization: `Bearer ${token}`,
      }
    )

    stompClient.publish({
      destination: `/app/chatRoom/create`,
      body: JSON.stringify({ nicknames }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } else {
    console.error('StompClient is not connected')
    onError('StompClient is not connected')
  }
}

export const createDuplicateChatRoom = (token: string, nicknames: string[]) => {
  if (stompClient && isConnected) {
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
  if (stompClient && isConnected) {
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
  if (stompClient && isConnected) {
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
  if (stompClient && isConnected) {
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
  if (stompClient && isConnected) {
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
  if (stompClient && isConnected) {
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
    if (stompClient && isConnected) {
      const onMessageReceived = (message: IMessage) => {
        resolve(JSON.parse(message.body))
      }

      const subscription = stompClient.subscribe(
        `/queue/chatroom/${chatRoomId}/update`,
        onMessageReceived,
        {
          Authorization: `Bearer ${token}`,
        }
      )
      return subscription
    } else {
      reject('WebSocket is not connected')
    }
  })
}
