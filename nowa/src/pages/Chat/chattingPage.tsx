import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useChatWebSocket } from '@/websocket/chatWebSocket'
import { useParams } from 'react-router-dom'
import { useApp } from '@/context/appContext'
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
  margin: 0;
  padding: 10px;
`

const MessageItem = styled.li`
  margin: 10px 0;
  padding: 10px;
  border-radius: 4px;
  background-color: #f1f1f1;
  display: flex;
  flex-direction: column;
`

const Sender = styled.strong`
  font-size: 1rem;
  color: #333;
`

const Content = styled.p`
  margin: 5px 0;
  font-size: 1rem;
  color: #555;
`

const Timestamp = styled.span`
  font-size: 0.8rem;
  color: #999;
  align-self: flex-end;
`

const InputContainer = styled.div`
  display: flex;
  padding: 10px;
  border-top: 1px solid #ccc;
  background-color: #f9f9f9;
`

const InputField = styled.input`
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`

const SendButton = styled.button`
  margin-left: 10px;
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`

// sender가 admin일때는 중앙정렬된 메시지로 출력
const ChattingPage: React.FC = () => {
  const { chatRoomId } = useParams<{ chatRoomId: string }>()
  const { chatRooms, messages, setMessages } = useChat()
  const { theme } = useApp()
  const token = localStorage.getItem('token') || ''
  const { subscribeToChatRoom } = useChatWebSocket()

  const [messageContent, setMessageContent] = useState('')

  const roomId = chatRoomId ? parseInt(chatRoomId, 10) : null
  const chatRoom = chatRooms.find((room) => room.chatRoomId === roomId)

  // 최근 메시지 요청 함수
  const getRecentMessages = () => {
    if (roomId === null) return // roomId가 null인 경우 처리

    const payload = {
      chatRoomId: roomId,
    }
    const stompClient = getStompClient()

    if (stompClient) {
      stompClient.publish({
        destination: '/app/chat/messages',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      // 입력 필드 초기화
    } else {
      console.error('StompClient is not connected.')
    }
  }

  // 메시지 전송
  const sendMessage = () => {
    if (!messageContent.trim() || roomId === null) return

    const payload = {
      chatRoomId: roomId,
      content: messageContent.trim(),
    }

    const stompClient = getStompClient()

    if (stompClient) {
      stompClient.publish({
        destination: '/app/chat/send',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      // 입력 필드 초기화
      setMessageContent('')
    } else {
      console.error('StompClient is not connected.')
    }
  }

  useEffect(() => {
    if (roomId === null) return // roomId가 null인 경우 처리

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
    return <div>채팅방을 찾을 수 없습니다.</div>
  }

  return (
    <ChatContainer>
      <MessageList>
        {messages.map((msg, index) => (
          <MessageItem key={index}>
            <Sender>{msg.sender}</Sender>
            <Content>{msg.content}</Content>
            <Timestamp>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </Timestamp>
          </MessageItem>
        ))}
      </MessageList>
      <InputContainer>
        <InputField
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="메시지를 입력하세요..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage()
            }
          }}
        />
        <SendButton onClick={sendMessage}>보내기</SendButton>
      </InputContainer>
    </ChatContainer>
  )
}

export default ChattingPage
