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
  cursor: pointer;
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
  flex: 1;
`
interface ChatRoom {
  id: number
  profilePic: string
  name: string
  lastMessage: string
  memberCount: number
  messages: {
    avatarSrc: string
    header: string
    time: string
    message: string
    footer: string
    alignment: 'start' | 'end'
  }[]
}

interface ChatListPageProps {
  chatRooms: ChatRoom[]
  onChatItemClick: (chatRoom: ChatRoom) => void
  onExitChatRoom: (id: number) => void
}

const ChatListPage: React.FC<ChatListPageProps> = ({
  chatRooms,
  onChatItemClick,
}) => {
  const hardcodedChatRoom: ChatRoom = {
    id: 1,
    profilePic: 'https://via.placeholder.com/40',
    name: 'Hardcoded Chat Room',
    lastMessage: 'This is a hardcoded message',
    memberCount: 2,
    messages: [
      {
        avatarSrc: 'https://via.placeholder.com/40',
        header: 'User1',
        time: '10:00 AM',
        message: 'Hello!',
        footer: 'Seen',
        alignment: 'start',
      },
      {
        avatarSrc: 'https://via.placeholder.com/40',
        header: 'User2',
        time: '10:01 AM',
        message: 'Hi there!',
        footer: 'Seen',
        alignment: 'end',
      },
    ],
  }

  const allChatRooms = [hardcodedChatRoom, ...chatRooms]

  return (
    <ChatListWrapper>
      {allChatRooms.map((chat) => (
        <ChatItem key={chat.id}>
          <div
            onClick={() => onChatItemClick(chat)}
            style={{ display: 'flex', flex: 1 }}
          >
            <ChatProfilePic src={chat.profilePic} alt="Profile" />
            <ChatContent>
              <span>
                {chat.name} ({chat.memberCount})
              </span>
              <span>{chat.lastMessage}</span>
            </ChatContent>
          </div>
        </ChatItem>
      ))}
    </ChatListWrapper>
  )
}

export default ChatListPage
