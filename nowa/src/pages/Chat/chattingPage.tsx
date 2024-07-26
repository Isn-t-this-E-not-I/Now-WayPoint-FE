import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { CompatClient } from '@stomp/stompjs'
import { subscribeToChatRoom } from '@/websocket/chatWebSocket'
import { ChatMessage } from '@/types'

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

interface ChattingPageProps {
  chatRoomId: number
  token: string
  stompClient: CompatClient
}

const ChattingPage: React.FC<ChattingPageProps> = ({
  chatRoomId,
  token,
  stompClient,
}) => {
  const [messages, setMessages] = useState<
    { sender: string; content: string }[]
  >([])

  // 최근 메시지 요청 함수
  const getRecentMessages = () => {
    const payload = {
      chatRoomId: chatRoomId,
    }

    stompClient.send(
      '/app/chat/messages',
      { Authorization: `Bearer ${token}` },
      JSON.stringify(payload)
    )
  }
  useEffect(() => {
    // 채팅방 구독 시작
    const subscription = subscribeToChatRoom(token, chatRoomId)

    // 최근 메시지 요청
    getRecentMessages()

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [chatRoomId, token, stompClient])

  return (
    <ChatContainer>
      <h2>Chat Room {chatRoomId}</h2>
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
