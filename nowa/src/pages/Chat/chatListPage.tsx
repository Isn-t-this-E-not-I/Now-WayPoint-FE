import React from 'react'
import { ChatRoom, ChatRoomInfo } from '../../types'

interface ChatListPageProps {
  chatRooms: ChatRoom[]
  chatRoomsInfo: ChatRoomInfo[]
  onChatItemClick: (chatRoom: ChatRoom) => void
}

const ChatListPage: React.FC<ChatListPageProps> = ({
  chatRooms,
  chatRoomsInfo,
  onChatItemClick,
}) => {
  return (
    <div>
      <h1>Chat Rooms</h1>
      <ul>
        {chatRooms.map((room) => {
          const roomInfo = chatRoomsInfo.find(
            (info) => info.chatRoomId === room.chatRoomId
          )
          return (
            <li key={room.chatRoomId}>
              <span onClick={() => onChatItemClick(room)}>
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
