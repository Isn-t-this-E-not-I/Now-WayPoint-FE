import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../context/chatContext';

const ChatListPage: React.FC = () => {
  const navigate = useNavigate();
  const { chatRooms, chatRoomsInfo } = useChat();

  const handleChatRoomClick = (chatRoomId: number) => {
    console.log(`Navigating to chat room with ID: ${chatRoomId}`); // 디버깅용
    navigate(`/chatting/${chatRoomId}`);
  };

  return (
    <div>
      <h1>Chat Rooms</h1>
      <ul>
        {chatRooms.map((room) => {
          const roomInfo = chatRoomsInfo.find(
            (info) => info.chatRoomId === room.chatRoomId
          )
          return (
            <li key={room.chatRoomId} onClick={() => handleChatRoomClick(room.chatRoomId)}>
              <span>
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