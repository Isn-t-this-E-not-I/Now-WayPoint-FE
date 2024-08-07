import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import { useChatWebSocket } from '@/websocket/chatWebSocket'
import { useParams } from 'react-router-dom'
import { useApp } from '@/context/appContext'
import { useChat } from '../../context/chatContext'
import { getStompClient } from '@/websocket/chatWebSocket'
import useModal from '@/hooks/modal'
import InviteModal from '../../components/Modal/inviteModal'
import { AddMemberIcon, ExitIcon } from '../../components/icons/icons'
import ChatBubble from '../../components/ChatBubble/chatBubble'

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: ${(props) => props.theme.backgroundColor || '#f0f0f0'};
  position: relative;
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  height: 60px;
  border-bottom: 1px solid #ccc;
  background-color: #f9f9f9;
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  margin-left: 0.5rem;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`

const ActionButton = styled.button`
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  align-items: center;
  justify-content: center;
  margin-top: -20px;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  &:focus {
    outline: none;
  }
`

const MessageList = styled.ul`
  list-style: none;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  flex-grow: 1;
  margin: 0;
  padding: 10px 15px 10px 15px;
  width: 100%;
`

const MessageItem = styled.li<{ $isSender: boolean }>`
  margin-right: ${(props) =>
    props.$isSender ? '15px' : '0'}; /* 발신 메시지 오른쪽 마진 */
  align-self: ${(props) => (props.$isSender ? 'flex-end' : 'flex-start')};
  position: relative;
  margin: 15px 0;
`

const AdminMessage = styled.div`
  text-align: center;
  color: #333;
  margin: 15px 0;
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
  background-color: #01317b;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #000947;
  }
`

const MissingChatWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  z-index: 1000;
`

const MissingChatSpan = styled.span`
  font-size: 1.5rem;
  z-index: 1000;
`

const NewMessageButton = styled.button<{ show: boolean }>`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background-color: rgba(248, 250, 255, 0.7);
  color: #151515;
  border: 1px solid;
  border-radius: 4px;
  cursor: pointer;
  display: ${(props) => (props.show ? 'block' : 'none')};

  &:hover {
    background-color: #f8faff;
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
  const messageListRef = useRef<HTMLUListElement>(null)

  const [messageContent, setMessageContent] = useState('')
  const { isOpen, open, close } = useModal()
  const [selectedUsers, setSelectedUsers] = useState('')

  const roomId: number | null = chatRoomId ? parseInt(chatRoomId, 10) : null
  const chatRoom = chatRooms.find((room) => room.chatRoomId === roomId)

  // 서버에서 이전 메시지 가져오기 함수 추가
  const fetchMessages = async (chatRoomId: number) => {
    try {
      const response = await fetch(`/api/messages?chatRoomId=${chatRoomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setMessages(data.messages)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  // 서버에 메시지 저장 함수 추가
  const saveMessage = async (message: {
    chatRoomId: number
    content: string
  }) => {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(message),
      })
    } catch (error) {
      console.error('Failed to save message:', error)
    }
  }

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

  const [showNewMessageButton, setShowNewMessageButton] = useState(false)

  // 메시지 전송
  const sendMessage = async () => {
    // async 추가
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

      // 서버에 메시지 저장
      await saveMessage(payload) // 메시지 저장 호출

      setMessageContent('')
      setTimeout(() => scrollToBottom(), 100) // 메시지를 보낸 후 최하단으로 스크롤
      setShowNewMessageButton(false) // 새 메시지 버튼 숨기기
    } else {
      console.error('StompClient is not connected.')
    }
  }

  // 최하단으로 스크롤 기능 함수
  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    }
  }

  // 메시지 수신 시 'useEffect' 훅에 새 메시지 버튼 표시 로직
  useEffect(() => {
    if (messageListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageListRef.current
      const isScrolledToBottom =
        Math.abs(scrollHeight - scrollTop - clientHeight) < 1

      if (
        !isScrolledToBottom &&
        messages[messages.length - 1]?.sender !== nickname
      ) {
        setShowNewMessageButton(true)
      } else {
        scrollToBottom()
        setShowNewMessageButton(false) // 새 메시지 버튼 숨기기
      }
    }
  }, [messages, nickname])

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
    console.log()
    if (
      confirm('채팅방에서 나가시겠습니까? 확인 시, 해당 채팅방이 삭제됩니다.')
    ) {
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
  }

  // 스크롤 위치 저장
  const saveScrollPosition = () => {
    if (roomId !== null && messageListRef.current) {
      const scrollPosition = messageListRef.current.scrollTop
      localStorage.setItem(
        `chatScrollPosition_${roomId}`,
        scrollPosition.toString()
      )
    }
  }

  // 스크롤 위치 복원
  const restoreScrollPosition = () => {
    if (roomId !== null && messageListRef.current) {
      const scrollPosition = localStorage.getItem(
        `chatScrollPosition_${roomId}`
      )
      if (scrollPosition !== null) {
        messageListRef.current.scrollTop = parseInt(scrollPosition, 10)
      }
    }
  }

  useEffect(() => {
    if (roomId === null) return

    const subscription = subscribeToChatRoom(roomId)
    fetchMessages(roomId) // 이전 메시지 불러오기
    getRecentMessages()
    restoreScrollPosition()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
      saveScrollPosition()
      setMessages([])
    }
  }, [roomId, token, setMessages])

  useEffect(() => {
    restoreScrollPosition()
  }, [messages])

  if (!chatRoom) {
    return (
      <MissingChatWrapper>
        <MissingChatSpan>채팅방을 찾을 수 없습니다.</MissingChatSpan>
      </MissingChatWrapper>
    )
  }

  // 프로필 이미지를 결정하는 부분 수정
  let displayProfileImages: string[] = []
  if (chatRoom.userResponses.length === 1) {
    displayProfileImages = ['default_profile_image_url'] // 1명일 경우 디폴트 이미지 설정
  } else {
    displayProfileImages = chatRoom.userResponses
      .filter((user) => user.userNickname !== nickname)
      .map((user) => user.profileImageUrl || 'default_profile_image_url') // 프로필 이미지가 없는 경우 디폴트 이미지 설정
  }

  // 채팅방 이름 결정 및 프로필 이미지 설정
  let displayName: string
  if (chatRoom.userResponses.length === 1) {
    displayName = '알수없음'
  } else {
    displayName = chatRoom.userResponses
      .filter((user) => user.userNickname !== nickname)
      .map((user) => user.userNickname)
      .join(', ')
  }

  return (
    <ChatContainer>
      <Header>
        <Title>{displayName}</Title>
        <ButtonContainer>
          <ActionButton onClick={open}>
            <AddMemberIcon theme={theme} />
          </ActionButton>
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
          <ActionButton onClick={leaveChatRoom}>
            <ExitIcon theme={theme} />
          </ActionButton>
        </ButtonContainer>
      </Header>
      {/* MessageList 컴포넌트에서 ChatBubble 사용 시 avatarSrc 전달 */}
      <MessageList ref={messageListRef}>
        {messages.map((msg, index) => {
          if (msg.sender === 'admin') {
            return (
              <MessageItem key={index} $isSender={false}>
                <AdminMessage>{msg.content}</AdminMessage>
              </MessageItem>
            )
          }

          if (msg.sender === nickname) {
            return (
              <MessageItem key={index} $isSender={true}>
                <ChatBubble
                  alignment="end"
                  avatarSrc=""
                  header=""
                  time={new Date(msg.timestamp).toLocaleTimeString()}
                  message={msg.content}
                  footer={new Date(
                    msg.timestamp
                  ).toLocaleTimeString()} /* 시간 표시를 아래로 이동 */
                />
              </MessageItem>
            )
          }

          return (
            <MessageItem key={index} $isSender={false}>
              <ChatBubble
                alignment="start"
                avatarSrc={
                  chatRoom.userResponses.find(
                    (user) => user.userNickname === msg.sender
                  )?.profileImageUrl || 'default_profile_image_url'
                }
                header={msg.sender}
                time=""
                message={msg.content}
                footer={new Date(
                  msg.timestamp
                ).toLocaleTimeString()} /* 시간 표시를 아래로 이동 */
              />
            </MessageItem>
          )
        })}
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
      {/* 새 메시지 확인 버튼 */}
      <NewMessageButton
        show={showNewMessageButton}
        onClick={() => {
          scrollToBottom()
          setShowNewMessageButton(false)
        }}
      >
        새 메시지 ↓
      </NewMessageButton>
    </ChatContainer>
  )
}

export default ChattingPage
