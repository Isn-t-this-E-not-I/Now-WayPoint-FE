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

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100vh;
  background-color: #f7f7f7;
`

const ChatApp: React.FC = () => {
  const [chatRooms, setChatRooms] = useState([
    {
      id: 1,
      profilePic: 'https://via.placeholder.com/40',
      name: 'Chat Room 1',
      lastMessage: 'Last message in chat room 1',
      memberCount: 5,
    },
    {
      id: 2,
      profilePic: 'https://via.placeholder.com/40',
      name: 'Chat Room 2',
      lastMessage: 'Last message in chat room 2',
      memberCount: 3,
    },
  ])

  const [selectedChatRoom, setSelectedChatRoom] = useState(chatRooms[0])
  const [token, setToken] = useState('')

  useEffect(() => {
    const loadChatRooms = async () => {
      const fetchedChatRooms = await fetchChatRooms()
      setChatRooms(fetchedChatRooms)
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
          // 메시지 처리 로직 추가
          setChatRooms((prevChatRooms) =>
            prevChatRooms.map((room) =>
              room.id === parsedMessage.chatRoomId
                ? { ...room, lastMessage: parsedMessage.content }
                : room
            )
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
  }, [token])

  const handleChatItemClick = (chatRoom: {
    id: number
    profilePic: string
    name: string
    lastMessage: string
    memberCount: number
  }) => {
    setSelectedChatRoom(chatRoom)
  }

  const handleExitChatRoom = (id: number) => {
    websocketLeaveChatRoom(token, id)
    setChatRooms((prevChatRooms) =>
      prevChatRooms.filter((room) => room.id !== id)
    )
    setSelectedChatRoom(chatRooms[0])
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
