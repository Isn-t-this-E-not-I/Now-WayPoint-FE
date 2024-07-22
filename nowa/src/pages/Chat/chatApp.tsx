import React, { useState, useEffect } from 'react'
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

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100vh;
  background-color: #f7f7f7;
`

const ChatApp: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(
    null
  )
  const [token, setToken] = useState('')

  useEffect(() => {
    const loadChatRooms = async () => {
      const fetchedChatRooms = await fetchChatRooms()
      const chatRoomsWithMessages = fetchedChatRooms.map((room: ChatRoom) => ({
        ...room,
        messages: [],
      }))
      setChatRooms(chatRoomsWithMessages)
      if (chatRoomsWithMessages.length > 0) {
        setSelectedChatRoom(chatRoomsWithMessages[0])
      }
    }

    loadChatRooms()
  }, [])

  useEffect(() => {
    connect(
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
      }
    )

    return () => {
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
      <ChatListPage
        chatRooms={chatRooms}
        onChatItemClick={handleChatItemClick}
        onExitChatRoom={handleExitChatRoom}
      />
      {selectedChatRoom && (
        <ChattingPage chatRoom={selectedChatRoom} token={token} />
      )}
    </AppWrapper>
  )
}

export default ChatApp
