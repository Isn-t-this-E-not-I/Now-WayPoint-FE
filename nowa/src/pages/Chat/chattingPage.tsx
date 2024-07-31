import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { subscribeToChatRoom } from '@/websocket/chatWebSocket'
import { useParams } from 'react-router-dom';
import { useApp } from '@/context/appContext';
import { useChat } from '../../context/chatContext'
import { getStompClient } from '@/websocket/chatWebSocket'

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`

const MessageList = styled.ul`
  list-style: none;
  padding: 0;
  overflow-y: auto;
  flex-grow: 1;
`

const MessageItem = styled.li`
  margin: 5px 0;
`

const ChattingPage: React.FC = () => {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const { chatRooms, messages, setMessages } = useChat();
  const { theme } = useApp();
  const token = useState<string>(localStorage.getItem('token') || '');

  const roomId = chatRoomId ? parseInt(chatRoomId, 10) : null;
  const chatRoom = chatRooms.find(room => room.chatRoomId === roomId);

  // 최근 메시지 요청 함수
  const getRecentMessages = () => {
    if (roomId === null) return; // roomId가 null인 경우 처리

    const payload = {
      chatRoomId: roomId
    }

    const stompClient = getStompClient();

    if (stompClient) {
      stompClient.publish({
        destination: '/app/chat/messages',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
    } else {
      console.error('StompClient is not connected.')
    }

  }

  useEffect(() => {
    if (roomId === null) return; // roomId가 null인 경우 처리

    // 채팅방 구독 시작
    const subscription = subscribeToChatRoom(roomId)

    // 최근 메시지 요청
    getRecentMessages()

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
      // 메시지 상태 초기화
      setMessages([])
    }
  }, [roomId, token, setMessages])

  if (!chatRoom) {
    return <div>채팅방을 찾을 수 없습니다.</div>;
  }

  return (
    <ChatContainer>
      <h2>{chatRoom.chatRoomName}</h2>
      <MessageList>
        {messages.map((msg, index) => (
          <MessageItem key={index}>
            <strong>{msg.sender}: </strong>
            {msg.content}
          </MessageItem>
        ))}
      </MessageList>
    </ChatContainer>
  )
}

export default ChattingPage