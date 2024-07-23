import React from 'react'
import styled from 'styled-components'

const ChatListWrapper = styled.div`
  padding: 10px;
  text-align: left;
`

const ChatItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
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

const MessageList = styled.div`
  max-height: 200px; /* 최대 높이 설정 */
  overflow-y: auto; /* 스크롤 활성화 */
  margin-top: 10px;
  border-top: 1px solid #ddd;
  padding-top: 10px;
`

interface MessageItemProps {
  alignment: 'start' | 'end'
}

const MessageItem = styled.div<MessageItemProps>`
  display: flex;
  justify-content: ${(props) =>
    props.alignment === 'start' ? 'flex-start' : 'flex-end'};
  padding: 5px 0;
`

const MessageBubble = styled.div<MessageItemProps>`
  max-width: 60%;
  padding: 10px;
  background-color: ${(props) =>
    props.alignment === 'start' ? '#f1f1f1' : '#007bff'};
  color: ${(props) => (props.alignment === 'start' ? '#000' : '#fff')};
  border-radius: 10px;
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
  return (
    <ChatListWrapper>
      {chatRooms.map((chat) => (
        <ChatItem key={chat.id} onClick={() => onChatItemClick(chat)}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ChatProfilePic src={chat.profilePic} alt="Profile" />
            <ChatContent>
              <span>
                {chat.name} ({chat.memberCount})
              </span>
              <span>{chat.lastMessage}</span>
            </ChatContent>
          </div>
          <MessageList>
            {chat.messages.slice(-50).map((message, index) => (
              <MessageItem key={index} alignment={message.alignment}>
                <MessageBubble alignment={message.alignment}>
                  {message.message}
                </MessageBubble>
              </MessageItem>
            ))}
          </MessageList>
        </ChatItem>
      ))}
    </ChatListWrapper>
  )
}

export default ChatListPage
