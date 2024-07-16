import React from 'react'
import styled from 'styled-components'

const ChatListWrapper = styled.div`
  padding: 10px;
  text-align: left;
`

const ChatItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`

const ChatProfilePic = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`

const ChatContent = styled.div`
  display: flex;
  flex-direction: column;
`

interface ChatListPageProps {
  chatRooms: {
    id: number
    profilePic: string
    name: string
    lastMessage: string
  }[]
}

const ChatListPage: React.FC<ChatListPageProps> = ({ chatRooms }) => {
  return (
    <ChatListWrapper>
      {chatRooms.map((chat) => (
        <ChatItem key={chat.id}>
          <ChatProfilePic src={chat.profilePic} alt="Profile" />
          <ChatContent>
            <span>{chat.name}</span>
            <span>{chat.lastMessage}</span>
          </ChatContent>
        </ChatItem>
      ))}
    </ChatListWrapper>
  )
}

export default ChatListPage
