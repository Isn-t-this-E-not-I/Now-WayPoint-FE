import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../../context/chatContext'
import styled from 'styled-components'

const Container = styled.div`
  padding: 20px;
  background-color: #f4f4f4;
  height: 100vh;
`

const ChatList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

const ChatListItem = styled.li`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #e0e0e0;
    transform: scale(1.02);
  }
`

const RoomName = styled.h2`
  font-size: 1.5rem;
  color: #007bff;
  margin: 0;
`

const RoomDetails = styled.div`
  margin-top: 10px;
  font-size: 0.9rem;
  color: #666;
`

const RoomDetail = styled.p`
  margin: 5px 0;
`

const ChatListPage: React.FC = () => {
  const navigate = useNavigate()
  const { chatRooms, chatRoomsInfo, setActiveChatRoomId } = useChat()
  const nickname = localStorage.getItem('nickname') || ''

  const handleChatRoomClick = (chatRoomId: number) => {
    setActiveChatRoomId(chatRoomId);
    navigate(`/chatting/${chatRoomId}`)
  }

  // 최근 메시지 기준으로 chatRooms를 정렬
  const sortedChatRooms = chatRooms.sort((a, b) => {
    const roomAInfo = chatRoomsInfo.find(info => info.chatRoomId === a.chatRoomId)
    const roomBInfo = chatRoomsInfo.find(info => info.chatRoomId === b.chatRoomId)

    const timestampA = roomAInfo ? new Date(roomAInfo.lastMessageTimestamp).getTime() : 0
    const timestampB = roomBInfo ? new Date(roomBInfo.lastMessageTimestamp).getTime() : 0

    return timestampB - timestampA // 내림차순 정렬
  })

  return (
    <Container>
      <ChatList>
        {sortedChatRooms.map((room) => {
          const roomInfo = chatRoomsInfo.find(
            (info) => info.chatRoomId === room.chatRoomId
          )

          let displayName: string
          if (room.userResponses.length === 1) {
            displayName = '알수없음'
          } else if (room.userResponses.length === 2) {
            const otherUser = room.userResponses.find(user => user.userNickname !== nickname)
            displayName = otherUser ? otherUser.userNickname : '알수없음'
          } else {
            displayName = room.chatRoomName
          }
          return (
            <ChatListItem
              key={room.chatRoomId}
              onClick={() => handleChatRoomClick(room.chatRoomId)}
            >
              <RoomName>{displayName}</RoomName>
              {roomInfo && (
                <RoomDetails>
                  <RoomDetail>Users: {room.userResponses.length}</RoomDetail>
                  {roomInfo.unreadMessagesCount > 0 && (
                    <RoomDetail>
                      Unread Messages: {roomInfo.unreadMessagesCount}
                    </RoomDetail>
                  )}
                  {roomInfo.lastMessageContent && (
                    <RoomDetail>
                      Last Message: {roomInfo.lastMessageContent}
                    </RoomDetail>
                  )}
                  {roomInfo.lastMessageTimestamp && (
                    <RoomDetail>
                      Timestamp: {roomInfo.lastMessageTimestamp}
                    </RoomDetail>
                  )}
                </RoomDetails>
              )}
            </ChatListItem>
          )
        })}
      </ChatList>
    </Container>
  )
}

export default ChatListPage