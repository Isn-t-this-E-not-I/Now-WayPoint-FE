import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../../context/chatContext'
import styled from 'styled-components'

const Container = styled.div`
  max-height: 90vh;
  padding: 10px;
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
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 10px;
  border-radius: 12px;
  border: 2.3px solid transparent;
  height: 7rem;
  width: 17rem;
  font-size: 15px;
  margin: 10px auto;
  background:
    linear-gradient(to right, #f8faff, #f8faff) padding-box,
    linear-gradient(to top left, #ae74bc, #01317b) border-box;
  cursor: pointer;

  transition:
    background-color 0.3s,
    transform 0.3s;

  &:hover {
    background-color: #e0e0e0;
    transform: scale(1.02);
  }
`

const RoomNameWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`

const RoomName = styled.h2`
  font-size: 1.3rem;
  font-weight: bold;
  color: #01317b;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`

const UserCount = styled.span`
  font-size: 1rem;
  color: #666;
  margin-left: 5px;
  margin-top: 5px;
`

const RoomDetails = styled.div`
  margin-top: 2px;
  font-size: 0.9rem;
  color: #151515;
  width: 100%;
`

const RoomDetail = styled.p`
  margin: 5px 0;
`

const TimeAgo = styled.span`
  color: #01317b;
  font-size: 12px;
  margin-left: 210px;
`

const ChatListPage: React.FC = () => {
  const navigate = useNavigate()
  const { chatRooms, chatRoomsInfo, setActiveChatRoomId } = useChat()
  const nickname = localStorage.getItem('nickname') || ''

  const handleChatRoomClick = (chatRoomId: number) => {
    setActiveChatRoomId(chatRoomId)
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
      return <TimeAgo>{days}일 전</TimeAgo>
    } else if (hours > 0) {
      return <TimeAgo>{hours}시간 전</TimeAgo>
    } else if (minutes > 0) {
      return <TimeAgo>{minutes}분 전</TimeAgo>
    } else {
      return <TimeAgo>방금 전</TimeAgo>
    }
  }

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
            const otherUser = room.userResponses.find(
              (user) => user.userNickname !== nickname
            )
            displayName = otherUser ? otherUser.userNickname : '알수없음'
          } else {
            displayName = room.chatRoomName
          }
          return (
            <ChatListItem
              key={room.chatRoomId}
              onClick={() => handleChatRoomClick(room.chatRoomId)}
            >
              <RoomNameWrapper>
                <RoomName>{displayName}</RoomName>
                <UserCount>({room.userResponses.length})</UserCount>
              </RoomNameWrapper>
              {roomInfo && (
                <RoomDetails>
                  {roomInfo.unreadMessagesCount > 0 && (
                    <RoomDetail>
                      Unread Messages: {roomInfo.unreadMessagesCount}
                    </RoomDetail>
                  )}
                  {roomInfo.lastMessageContent && (
                    <RoomDetail>
                      마지막 메시지 : {roomInfo.lastMessageContent}
                    </RoomDetail>
                  )}
                  {roomInfo.lastMessageTimestamp && (
                    <RoomDetail>
                      {formatRelativeTime(roomInfo.lastMessageTimestamp)}
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
