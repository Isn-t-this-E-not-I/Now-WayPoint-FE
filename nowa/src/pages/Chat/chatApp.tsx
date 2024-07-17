import React, { useState } from 'react'
import styled from 'styled-components'
import Sidebar from '../../components/Sidebar/sidebar'
import ChattingPage from './chattingPage'

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
    },
    {
      id: 2,
      profilePic: 'https://via.placeholder.com/40',
      name: 'Chat Room 2',
      lastMessage: 'Last message in chat room 2',
    },
  ])

  const [selectedChatRoom, setSelectedChatRoom] = useState(chatRooms[0])

  const handleChatItemClick = (
    chatRoom: React.SetStateAction<{
      id: number
      profilePic: string
      name: string
      lastMessage: string
    }>
  ) => {
    setSelectedChatRoom(chatRoom)
  }

  const handleChatRoomNameChange = (id: number, newName: string) => {
    const updatedChatRooms = chatRooms.map((chatRoom) =>
      chatRoom.id === id ? { ...chatRoom, name: newName } : chatRoom
    )
    setChatRooms(updatedChatRooms)
    if (selectedChatRoom.id === id) {
      setSelectedChatRoom({ ...selectedChatRoom, name: newName })
    }
  }

  return (
    <AppWrapper>
      <Sidebar
        chatRooms={chatRooms}
        onChatItemClick={handleChatItemClick}
        onExitChatRoom={(id: number) =>
          setChatRooms(chatRooms.filter((chatRoom) => chatRoom.id !== id))
        }
        theme={'dark'}
        setSelectedPage={(page: string) => {
          console.log(`Selected page: ${page}`)
        }}
        setChatRooms={setChatRooms}
        onCreateChat={function (newChatRoom: {
          id: number
          profilePic: string
          name: string
          lastMessage: string
        }): void {
          throw new Error('Function not implemented.')
        }}
      />
      {selectedChatRoom && (
        <ChattingPage
          chatRoom={selectedChatRoom}
          onChatRoomNameChange={handleChatRoomNameChange}
        />
      )}
    </AppWrapper>
  )
}

export default ChatApp
