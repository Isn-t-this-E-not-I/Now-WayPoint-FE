import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import ChatListPage from './chatListPage'
import ChattingPage from './chattingPage'
import { fetchChatRooms } from '../../api/chatApi'
import {
  connect,
  disconnect,
  leaveChatRoom as websocketLeaveChatRoom,
} from '../../websocket/chatWebSocket'
import { ChatRoom } from '../../types'
import Sidebar from '../../components/Sidebar/sidebar'

const AppWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #f7f7f7;
`

const WebSocketStatus = styled.div<{ connected: boolean }>`
  position: fixed;
  bottom: 10px;
  right: 10px;
  padding: 10px;
  background-color: ${(props) => (props.connected ? 'green' : 'red')};
  color: white;
  border-radius: 5px;
`

const ChatApp: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(
    null
  )
  const [token, setToken] = useState('')
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    // Simulate fetching a token (replace with real authentication logic)
    const fakeToken = 'fake-token'
    setToken(fakeToken)
  }, [])

  useEffect(() => {
    const loadChatRooms = async () => {
      if (token) {
        const fetchedChatRooms = await fetchChatRooms(token)
        const chatRoomsWithMessages = fetchedChatRooms.map(
          (room: ChatRoom) => ({
            ...room,
            messages: [],
          })
        )
        setChatRooms(chatRoomsWithMessages)
        if (chatRoomsWithMessages.length > 0) {
          setSelectedChatRoom(chatRoomsWithMessages[0])
        }
      }
    }

    loadChatRooms()
  }, [token])

  useEffect(() => {
    if (token) {
      const subscription = connect(
        token,
        (message) => {
          console.log('Received message: ', message.body)
          const parsedMessage = JSON.parse(message.body)
          if (parsedMessage.type === 'CHAT') {
            // 메시지 처리 로직
            setChatRooms((prevChatRooms) =>
              prevChatRooms.map((room) => {
                if (room.id === parsedMessage.chatRoomId) {
                  const updatedRoom = {
                    ...room,
                    lastMessage: parsedMessage.content,
                    messages: [...room.messages, parsedMessage],
                  }
                  // 현재 선택된 채팅방의 메시지를 업데이트
                  if (selectedChatRoom && selectedChatRoom.id === room.id) {
                    setSelectedChatRoom(updatedRoom)
                  }
                  return updatedRoom
                }
                return room
              })
            )
          }
        },
        () => {
          console.log('WebSocket connected')
          setIsWebSocketConnected(true)
        },
        (error) => {
          console.error('WebSocket error: ', error)
          setIsWebSocketConnected(false)
        }
      )
      subscriptionRef.current = subscription
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
      disconnect()
    }
  }, [token, selectedChatRoom])

  const handleChatItemClick = (chatRoom: ChatRoom) => {
    setSelectedChatRoom(chatRoom)
  }

  const handleExitChatRoom = (id: number) => {
    websocketLeaveChatRoom(token, id)
    setChatRooms((prevChatRooms) =>
      prevChatRooms.filter((room) => room.id !== id)
    )
    if (chatRooms.length > 0) {
      setSelectedChatRoom(chatRooms[0])
    } else {
      setSelectedChatRoom(null)
    }
  }

  const handleCreateChat = (newChatRoom: ChatRoom) => {
    setChatRooms((prevChatRooms) => [...prevChatRooms, newChatRoom])
    setSelectedChatRoom(newChatRoom)
  }

  return (
    <AppWrapper>
      <Sidebar
        theme={'light'}
        setSelectedPage={() => {}}
        chatRooms={chatRooms}
        onChatItemClick={handleChatItemClick}
        onExitChatRoom={handleExitChatRoom}
        setChatRooms={setChatRooms}
        onCreateChat={handleCreateChat}
        token={token}
      />
      <div style={{ flex: 1 }}>
        {selectedChatRoom ? (
          <ChattingPage chatRoom={selectedChatRoom} token={token} />
        ) : (
          <ChatListPage
            chatRooms={chatRooms}
            onChatItemClick={handleChatItemClick}
            onExitChatRoom={handleExitChatRoom}
          />
        )}
      </div>
      <WebSocketStatus connected={isWebSocketConnected}>
        {isWebSocketConnected
          ? 'WebSocket is connected'
          : 'WebSocket is not connected'}
      </WebSocketStatus>
    </AppWrapper>
  )
}

export default ChatApp
