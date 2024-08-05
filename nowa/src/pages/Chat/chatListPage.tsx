import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../../context/chatContext'
import styled from 'styled-components'

const Container = styled.div`
  background-color: #f8faff;
  height: 90vh;
  width: 100%;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
`

const ChatList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

const ChatListItem = styled.li`
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  margin: 10px auto;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.3s;
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
  const { chatRooms, chatRoomsInfo } = useChat()

  const handleChatRoomClick = (chatRoomId: number) => {
    navigate(`/chatting/${chatRoomId}`)
  }

  // 최근 메시지 기준으로 chatRooms를 정렬
  const sortedChatRooms = chatRooms.sort((a, b) => {
    const roomAInfo = chatRoomsInfo.find(
      (info) => info.chatRoomId === a.chatRoomId
    )
    const roomBInfo = chatRoomsInfo.find(
      (info) => info.chatRoomId === b.chatRoomId
    )

    const timestampA = roomAInfo
      ? new Date(roomAInfo.lastMessageTimestamp).getTime()
      : 0
    const timestampB = roomBInfo
      ? new Date(roomBInfo.lastMessageTimestamp).getTime()
      : 0

    return timestampB - timestampA // 내림차순 정렬
  })

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date().getTime()
    const time = new Date(timestamp).getTime()
    const diff = now - time

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) {
      return `${days}일 전`
    } else if (hours > 0) {
      return `${hours}시간 전`
    } else if (minutes > 0) {
      return `${minutes}분 전`
    } else {
      return '방금 전'
    }
  }

  return (
    <Container>
      <ChatList>
        {sortedChatRooms.map((room) => {
          const roomInfo = chatRoomsInfo.find(
            (info) => info.chatRoomId === room.chatRoomId
          )
          return (
            <ChatListItem
              key={room.chatRoomId}
              onClick={() => handleChatRoomClick(room.chatRoomId)}
            >
              <RoomName>{room.chatRoomName}</RoomName>
              {roomInfo && (
                <RoomDetails>
                  {/* <RoomDetail>Users: {room.userCount}</RoomDetail> */}
                  {/* <RoomDetail>
                    Unread Messages: {roomInfo.unreadMessagesCount}
                  </RoomDetail> */}
                  <RoomDetail>{roomInfo.lastMessageContent}</RoomDetail>
                  <RoomDetail>
                    {formatRelativeTime(roomInfo.lastMessageTimestamp)}
                  </RoomDetail>
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
