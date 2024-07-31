import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../../context/chatContext'

const ChatListPage: React.FC = () => {
  const navigate = useNavigate()
  const { chatRooms, chatRoomsInfo } = useChat()

  const handleChatRoomClick = (chatRoomId: number) => {
    navigate(`/chatting/${chatRoomId}`)
  }

  // 최신 메시지 시각에 따라 채팅방 정렬
  const sortedChatRooms = chatRooms.slice().sort((a, b) => {
    const roomInfoA = chatRoomsInfo.find(
      (info) => info.chatRoomId === a.chatRoomId
    )
    const roomInfoB = chatRoomsInfo.find(
      (info) => info.chatRoomId === b.chatRoomId
    )

    if (roomInfoA && roomInfoB) {
      return (
        new Date(roomInfoB.lastMessageTimestamp).getTime() -
        new Date(roomInfoA.lastMessageTimestamp).getTime()
      )
    } else if (roomInfoA) {
      return -1
    } else if (roomInfoB) {
      return 1
    } else {
      return 0
    }
  })

  return (
    <div>
      <h1>Chat Rooms</h1>
      <ul>
        {sortedChatRooms.map((room) => {
          const roomInfo = chatRoomsInfo.find(
            (info) => info.chatRoomId === room.chatRoomId
          )
          return (
            <li key={room.chatRoomId}>
              <span onClick={() => handleChatRoomClick(room.chatRoomId)}>
                {room.chatRoomName}
              </span>
              {roomInfo && (
                <div>
                  <p>Users: {room.userCount}</p>
                  <p>Unread Messages: {roomInfo.unreadMessagesCount}</p>
                  <p>Last Message: {roomInfo.lastMessageContent}</p>
                  <p>Timestamp: {roomInfo.lastMessageTimestamp}</p>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ChatListPage
