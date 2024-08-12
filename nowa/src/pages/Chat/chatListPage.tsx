import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../../context/chatContext'
import styled, { css } from 'styled-components'
import NoChatListImage from '../../assets/characters-01-ezgif.com-gif-maker.gif'
import { setActiveChatRoomPage } from '../../websocket/chatWebSocket'

const ChatListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 90vh;
  max-height: 90vh;
  padding-left: 18px;
  padding-top: 3px;
  width: 19.8rem;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
`

const ChatList = styled.ul`
  list-style: none;
  padding-left: 10px;
  margin: -12px;
`

const ChatListItem = styled.li`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 10px;
  border-radius: 12px;
  border: 2.3px solid transparent;
  height: 5rem;
  width: 18.2rem;
  font-size: 15px;
  margin: 10px auto;
  background:
    linear-gradient(to right, #f8faff, #f8faff) padding-box,
    linear-gradient(to top left, #ae74bc, #01317b) border-box;
  cursor: pointer;
  overflow: hidden;

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
interface RoomNameProps {
  istruncated: boolean
}

const RoomName = styled.h2<RoomNameProps>`
  font-size: 1rem;
  font-weight: bold;
  color: #01317b;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;

  &:after {
    content: '...';
    display: ${(props) => (props.istruncated ? 'inline' : 'none')};
  }
`

interface UserResponse {
  userNickname: string
  profileImageUrl?: string
}

const ProfileImages = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  margin-bottom: -5px;
  flex-shrink: 0;
`

const ProfileImage = styled.img<{ isFirst?: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid white;
  object-fit: cover;
  flex-shrink: 0;
  ${(props) =>
    !props.isFirst &&
    css`
      margin-left: -10px;
    `}
`

const DefaultProfileImage = styled.div<{ isFirst?: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #ccc;
  border: 2px solid white;
  object-fit: cover;
  flex-shrink: 0;
  ${(props) =>
    !props.isFirst &&
    css`
      margin-left: -10px;
    `}
`

const UserCountWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;
`

const UserCount = styled.span`
  font-size: 0.7rem;
  color: #666;
  margin-left: 3px;
`

const Badge = styled.span`
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 4px 6px;
  font-size: 11px;
  font-weight: bold;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  width: 22px;
  height: 22px;
`

const RoomDetails = styled.div`
  margin-top: 2px;
  font-size: 0.9rem;
  color: #151515;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const RoomDetail = styled.p`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 5px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 80%; /* Adjusted width to make space for the timestamp */
`

const TimeAgo = styled.span`
  color: #aaa;
  font-size: 12px;
  margin-left: auto;
`

const getProfileImages = (
  userResponses: UserResponse[],
  nickname: string
): string[] => {
  const filteredUsers = userResponses.filter(
    (user) => user.userNickname !== nickname
  )
  const profileImages = filteredUsers
    .slice(0, 4) // 최대 4개의 프로필 이미지
    .map((user) => user.profileImageUrl || 'default_profile_image_url')
  return profileImages
}

const ChatListPage: React.FC = () => {
  const navigate = useNavigate()
  const { chatRooms, chatRoomsInfo, setChatRoomsInfo } = useChat()
  const nickname = localStorage.getItem('nickname') || ''

  const handleChatRoomClick = (chatRoomId: number) => {
    setActiveChatRoomPage(chatRoomId)

    // Unread Messages 초기화 로직
    const updatedChatRoomsInfo = chatRoomsInfo.map((roomInfo) => {
      if (roomInfo.chatRoomId === chatRoomId) {
        return { ...roomInfo, unreadMessagesCount: 0 }
      }
      return roomInfo
    })
    setChatRoomsInfo(updatedChatRoomsInfo)

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
    <ChatListWrapper>
      <>
        {sortedChatRooms.length < 1 ? (
          <div
            className="flex flex-col items-center justify-center"
            style={{ width: '300px', height: '100vh' }}
          >
            <img
              src={NoChatListImage}
              alt="No Notifications"
              style={{
                backgroundColor: 'transparent',
                width: '150px',
                height: '150px',
              }}
            />
            <div className="mt-4">메세지를 보내보세요!</div>
          </div>
        ) : (
          <ChatList>
            {sortedChatRooms.map((room) => {
              const roomInfo = chatRoomsInfo.find(
                (info) => info.chatRoomId === room.chatRoomId
              )

              let displayName: string
              if (room.userResponses.length === 1) {
                displayName = '알수없음'
              } else {
                displayName = room.userResponses
                  .filter((user) => user.userNickname !== nickname)
                  .map((user) => user.userNickname)
                  .join(', ')
              }
              const isTruncated = displayName.length > 18

              const displayProfileImages = getProfileImages(
                room.userResponses,
                nickname
              )

              return (
                <ChatListItem
                  key={room.chatRoomId}
                  onClick={() => handleChatRoomClick(room.chatRoomId)}
                >
                  <RoomNameWrapper>
                    <ProfileImages>
                      {displayProfileImages.length === 0 ? (
                        <DefaultProfileImage isFirst={true} />
                      ) : (
                        displayProfileImages.map((src, index) => (
                          <ProfileImage
                            key={index}
                            src={src}
                            isFirst={index === 0}
                          />
                        ))
                      )}
                    </ProfileImages>
                    <RoomName istruncated={isTruncated}>
                      {isTruncated ? displayName.slice(0, 18) : displayName}
                    </RoomName>
                    <UserCountWrapper>
                      <UserCount>({room.userResponses.length})</UserCount>
                      {roomInfo && roomInfo.unreadMessagesCount > 0 && (
                        <Badge>
                          {roomInfo.unreadMessagesCount > 99
                            ? '99+'
                            : roomInfo.unreadMessagesCount}
                        </Badge>
                      )}
                    </UserCountWrapper>
                  </RoomNameWrapper>
                  {roomInfo && (
                    <RoomDetails>
                      {roomInfo.lastMessageContent && (
                        <RoomDetail>
                          {roomInfo.lastMessageContent.length > 20
                            ? `${roomInfo.lastMessageContent.slice(0, 20)}...`
                            : roomInfo.lastMessageContent}
                        </RoomDetail>
                      )}
                      {roomInfo.lastMessageTimestamp && (
                        <TimeAgo>
                          {formatRelativeTime(roomInfo.lastMessageTimestamp)}
                        </TimeAgo>
                      )}
                    </RoomDetails>
                  )}
                </ChatListItem>
              )
            })}
          </ChatList>
        )}
      </>
    </ChatListWrapper>
  )
}

export default ChatListPage
