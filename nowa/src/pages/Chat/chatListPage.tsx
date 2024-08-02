import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../context/chatContext';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  background-color: #f4f4f4;
  height: 100vh;
`;

const Heading = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
`;

const ChatList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

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
`;

const RoomName = styled.h2`
  font-size: 1.5rem;
  color: #007bff;
  margin: 0;
`;

const RoomDetails = styled.div`
  margin-top: 10px;
  font-size: 0.9rem;
  color: #666;
`;

const RoomDetail = styled.p`
  margin: 5px 0;
`;

const ChatListPage: React.FC = () => {
  const navigate = useNavigate();
  const { chatRooms, chatRoomsInfo } = useChat();

  const handleChatRoomClick = (chatRoomId: number) => {
    navigate(`/chatting/${chatRoomId}`);
  };

  return (
    <Container>
      <Heading>Chat Rooms</Heading>
      <ChatList>
        {chatRooms.map((room) => {
          const roomInfo = chatRoomsInfo.find(
            (info) => info.chatRoomId === room.chatRoomId
          );
          return (
            <ChatListItem
              key={room.chatRoomId}
              onClick={() => handleChatRoomClick(room.chatRoomId)}
            >
              <RoomName>{room.chatRoomName}</RoomName>
              {roomInfo && (
                <RoomDetails>
                  <RoomDetail>Users: {room.userCount}</RoomDetail>
                  <RoomDetail>Unread Messages: {roomInfo.unreadMessagesCount}</RoomDetail>
                  <RoomDetail>Last Message: {roomInfo.lastMessageContent}</RoomDetail>
                  <RoomDetail>Timestamp: {roomInfo.lastMessageTimestamp}</RoomDetail>
                </RoomDetails>
              )}
            </ChatListItem>
          );
        })}
      </ChatList>
    </Container>
  );
};

export default ChatListPage;