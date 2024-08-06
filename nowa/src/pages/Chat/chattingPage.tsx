import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useChatWebSocket } from '@/websocket/chatWebSocket'
import { useParams } from 'react-router-dom'
import { useApp } from '@/context/appContext'
import { useChat } from '../../context/chatContext'
import { getStompClient } from '@/websocket/chatWebSocket'
import useModal from '@/hooks/modal'
import InviteModal from '../../components/Modal/inviteModal'

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: ${(props) => props.theme.backgroundColor || '#f0f0f0'};
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
  background-color: #f9f9f9;
`

const Title = styled.h1`
  font-size: 1.5rem;
  margin: 0;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`

const ActionButton = styled.button`
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  background-color: #007bff;

  &:hover {
    background-color: #0056b3;
  }

  &:focus {
    outline: none;
  }
`

const MessageList = styled.ul`
  list-style: none;
  padding: 0;
  overflow-y: auto;
  flex-grow: 1;
  margin: 0;
  padding: 10px;
`

const MessageItem = styled.li<{ $isSender: boolean }>`
  margin: 10px 0;
  padding: 10px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.$isSender ? 'flex-end' : 'flex-start')};
  background-color: ${(props) => (props.$isSender ? '#007bff' : '#f1f1f1')};
  color: ${(props) => (props.$isSender ? 'white' : '#333')};
  text-align: ${(props) => (props.$isSender ? 'right' : 'left')};
  position: relative;
`

const Sender = styled.strong`
  font-size: 1rem;
  color: #333;
`

const Content = styled.p`
  margin: 5px 0;
  font-size: 1rem;
`

const Timestamp = styled.span<{ $isSender: boolean }>`
  font-size: 0.8rem;
  color: #999;
  align-self: ${(props) =>
    props.$isSender ? 'flex-start' : 'flex-end'}; /* 위치 조정 */
  position: absolute;
  bottom: 5px;
  right: ${(props) => (props.$isSender ? '10px' : 'auto')};
  left: ${(props) => (props.$isSender ? 'auto' : '10px')};
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

const ChattingPage: React.FC = () => {
  const { chatRoomId } = useParams<{ chatRoomId: string }>()
  const { chatRooms, messages, setChatRooms, setChatRoomsInfo, setMessages } =
    useChat()
  const { theme } = useApp()
  const token = localStorage.getItem('token') || ''
  const nickname = localStorage.getItem('nickname') || ''
  const { subscribeToChatRoom } = useChatWebSocket()

  const [messageContent, setMessageContent] = useState('')
  const { isOpen, open, close } = useModal()
  const [selectedUsers, setSelectedUsers] = useState('')

  const roomId = chatRoomId ? parseInt(chatRoomId, 10) : null
  const chatRoom = chatRooms.find((room) => room.chatRoomId === roomId)

  // 최근 메시지 요청 함수
  const getRecentMessages = () => {
    if (roomId === null) return
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

      setMessageContent('')
    } else {
      console.error('StompClient is not connected.')
    }
  }

  // 채팅방 초대 함수
  const inviteToChatRoom = (e: React.FormEvent) => {
    e.preventDefault()
    const usernames = selectedUsers.split(',').map((user) => user.trim())
    const payload = {
      chatRoomId: roomId,
      nicknames: usernames,
    }
    const stompClient = getStompClient()
    if (stompClient) {
      stompClient.publish({
        destination: '/app/chatRoom/invite',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
    } else {
      console.error('StompClient is not connected.')
    }
    setSelectedUsers('')
  }

  // 채팅방 나가기 함수
  const leaveChatRoom = () => {
    const payload = {
      chatRoomId: roomId,
    }
    const stompClient = getStompClient()
    if (stompClient) {
      stompClient.publish({
        destination: '/app/chatRoom/leave',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
    } else {
      console.error('StompClient is not connected.')
    }
  }

  useEffect(() => {
    if (roomId === null) return

    const subscription = subscribeToChatRoom(roomId)
    getRecentMessages()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
      setMessages([])
    }
  }, [roomId, token, setMessages])

  if (!chatRoom) {
    return <div>채팅방을 찾을 수 없습니다.</div>
  }

  // 채팅방 이름 결정
  let displayName: string
  if (chatRoom.userResponses.length === 1) {
    displayName = '알수없음'
  } else if (chatRoom.userResponses.length === 2) {
    const otherUser = chatRoom.userResponses.find(
      (user) => user.userNickname !== nickname
    )
    displayName = otherUser ? otherUser.userNickname : '알수없음'
  } else {
    displayName = chatRoom.chatRoomName
  }

  return (
    <ChatContainer>
      <Header>
        <Title>{displayName}</Title>
        <ButtonContainer>
          <ActionButton onClick={open}>채팅방 초대</ActionButton>
          {isOpen && (
            <InviteModal
              isOpen={isOpen}
              onClose={close}
              showCloseButton={false}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              handleSubmit={inviteToChatRoom}
              theme={theme}
            />
          )}
          <ActionButton onClick={leaveChatRoom}>채팅방 나가기</ActionButton>
        </ButtonContainer>
      </Header>
      <MessageList>
        {messages.map((msg, index) => (
          <MessageItem key={index} $isSender={msg.sender === nickname}>
            {msg.sender !== 'admin' && <Sender>{msg.sender}</Sender>}
            <Content>{msg.content}</Content>
            <Timestamp $isSender={msg.sender === nickname}>
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
              e.preventDefault()
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
