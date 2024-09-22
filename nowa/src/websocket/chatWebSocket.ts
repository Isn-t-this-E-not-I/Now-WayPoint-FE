import { CompatClient, Stomp } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ChatRoom, ChatMessage } from '@/types'
import { useChat } from '@/context/chatContext'
import { useNavigate } from 'react-router-dom'

let stompClient: CompatClient | null = null
let chatRoomSubscription: any = null
let activeChatRoomPage: number
export const getStompClient = () => stompClient
export const setActiveChatRoomPage = (number: number) =>
  (activeChatRoomPage = number)

export const useChatWebSocket = () => {
  const navigate = useNavigate()
  const { setChatRooms, setMessages, setChatRoomsInfo } = useChat()
  const token = localStorage.getItem('token') || ''
  const nickname = localStorage.getItem('nickname') || ''

  const connectAndSubscribe = () => {
    const socket = new SockJS('https://subdomain.now-waypoint.store:8080/ws')
    stompClient = Stomp.over(() => socket)

    const onConnect = () => {
      stompClient!.subscribe(
        `/queue/chatroom/${localStorage.getItem('nickname')}`,
        (message) => handleMessageUser(message)
      )
    }

    stompClient.connect({ Authorization: `Bearer ${token}` }, onConnect)
  }

  const disconnect = () => {
    if (stompClient) {
      stompClient.disconnect(() => {
      })
      stompClient = null
    }
  }

  const subscribeToChatRoom = (chatRoomId: number) => {
    if (stompClient) {
      chatRoomSubscription = stompClient.subscribe(
        `/topic/chatroom/${chatRoomId}`,
        (message) => handleMessageChatRoom(message)
      )
      return chatRoomSubscription
    } else {
      console.error('WebSocket is not connected.')
    }
  }

  const handleMessageUser = (message: { body: string }) => {
    const parsedMessage = JSON.parse(message.body)
    switch (parsedMessage.messageType) {
      case 'CREATE':
        const newChatRoom: ChatRoom = {
          chatRoomId: parsedMessage.chatRoomId,
          chatRoomName: parsedMessage.chatRoomName,
          userResponses: parsedMessage.userResponses,
        }
        setChatRooms((prev) => !prev.some((f) => f.chatRoomId === newChatRoom.chatRoomId) ? [newChatRoom, ...prev] : prev);
        setChatRoomsInfo((prevChatRoomsInfo) => [
          ...prevChatRoomsInfo,
          {
            chatRoomId: parsedMessage.chatRoomId,
            chatRoomName: parsedMessage.chatRoomName,
            unreadMessagesCount: 0,
            lastMessageContent: '',
            lastMessageTimestamp: '',
          },
        ])
        if (parsedMessage.requestUser === nickname) {
          navigate(`/chatting/${parsedMessage.chatRoomId}`)
        }
        break
      case 'CHAT_LIST':
        const newMessages: ChatMessage[] = parsedMessage.messages.map(
          (msg: any) => ({
            sender: msg.sender,
            content: msg.content,
            timestamp: msg.timestamp,
          })
        )
        newMessages.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        setMessages(newMessages)
        break
      case 'CHAT':
        setChatRoomsInfo((prevChatRoomsInfo) => {
          return prevChatRoomsInfo.map((info) => {
            if (info.chatRoomId === parsedMessage.chatRoomId) {
              if (activeChatRoomPage === parsedMessage.chatRoomId) {
                return {
                  ...info,
                  unreadMessagesCount: 0,
                  lastMessageContent: parsedMessage.content,
                  lastMessageTimestamp: parsedMessage.timestamp,
                }
              } else if (
                parsedMessage.sender !== 'admin' &&
                parsedMessage.sender !== nickname
              ) {
                return {
                  ...info,
                  unreadMessagesCount: (info.unreadMessagesCount || 0) + 1,
                  lastMessageContent: parsedMessage.content,
                  lastMessageTimestamp: parsedMessage.timestamp,
                }
              }
            }
            return info
          })
        })
        break
      case 'INVITE':
        setChatRooms((prevChatRooms) => {
          return prevChatRooms.map((info) => {
            if (info.chatRoomId === parsedMessage.chatRoomId) {
              return {
                ...info,
                userInfo: [
                  ...info.userResponses,
                  ...parsedMessage.userResponses,
                ],
              }
            }
            return info
          })
        })
        break
      case 'LEAVE':
        setChatRooms((prevChatRooms) => {
          // chatRoomId가 parsedMessage.chatRoomId와 일치하지 않는 항목만 남깁니다.
          return prevChatRooms.filter(
            (info) => info.chatRoomId !== parsedMessage.chatRoomId
          )
        })
        setChatRoomsInfo((prevChatRoomsInfo) => {
          return prevChatRoomsInfo.filter(
            (info) => info.chatRoomId !== parsedMessage.chatRoomId
          )
        })
        break
      case 'USER_NAME_UPDATE':
        setChatRooms((prevChatRooms) => {
          return prevChatRooms.map((info) => {
            if (info.chatRoomId === parsedMessage.chatRoomId) {
              const updatedUserResponses = info.userResponses.map((user) => {
                if (user.userNickname === parsedMessage.oldNickname) {
                  return {
                    ...user,
                    userNickname: parsedMessage.newNickname,
                  };
                }
                return user
              });

              return {
                ...info,
                userResponses: updatedUserResponses,
              }
            }
            return info
          })
        })

        setChatRoomsInfo((prevChatRoomsInfo) => {
          return prevChatRoomsInfo.map((info) => {
            if (info.chatRoomId === parsedMessage.chatRoomId) {
              return {
                ...info,
              }
            }
            return info
          })
        })
        break
      case 'ERROR':
        alert(parsedMessage.content)
        break
      case 'ERROR_DUPLICATE':
        navigate(`/chatting/${parsedMessage.chatRoomId}`)
        break
      default:
        break
    }
  }

  const handleMessageChatRoom = (message: { body: string }) => {
    const parsedMessage = JSON.parse(message.body)
    switch (parsedMessage.messageType) {
      case 'CHAT':
        const newMessage: ChatMessage = {
          sender: parsedMessage.sender,
          content: parsedMessage.content,
          timestamp: parsedMessage.timestamp,
        }

        setMessages((prevMessages) => {
          // 기존 메시지 목록에 새로운 메시지를 추가하여 새로운 배열을 반환합니다.
          return [...prevMessages, newMessage]
        })
        break
      case 'NAME_UPDATE':
        setChatRooms((prevChatRooms) => {
          return prevChatRooms.map((info) => {
            if (info.chatRoomId === parsedMessage.chatRoomId) {
              return {
                ...info,
                chatRoomName: parsedMessage.chatRoomName,
              }
            }
            return info
          })
        })
        break
      case 'LEAVE':
        setChatRooms((prevChatRooms) => {
          return prevChatRooms.map((info) => {
            if (info.chatRoomId === parsedMessage.chatRoomId) {
              return {
                ...info,
                userResponses: parsedMessage.userResponses, // 나가고 남은 사용자 목록으로 업데이트
              }
            }
            return info
          })
        })
        break
      case 'USER_NAME_UPDATE':
        setMessages((prevMessages) => {
          return prevMessages.map((msg) => {
            if (msg.sender === parsedMessage.oldNickname) {
              return {
                ...msg,
                sender: parsedMessage.newNickname,
              };
            }
            return msg
          })
        })
        break
      default:
        break
    }
  }

  return {
    connectAndSubscribe,
    disconnect,
    subscribeToChatRoom,
  }
}
