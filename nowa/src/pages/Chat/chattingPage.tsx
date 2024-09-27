import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import { useChatWebSocket } from '@/websocket/chatWebSocket'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/appContext'
import { useChat } from '../../context/chatContext'
import { getStompClient } from '@/websocket/chatWebSocket'
import useModal from '@/hooks/modal'
import AddUserModal from '@/components/Modal/addUserModal'
import { AddMemberIcon, ExitIcon } from '../../components/icons/icons'
import ChatBubble from '../../components/Chat/chatBubble'
import Modal from '../../components/Modal/modal'
import Button from '../../components/Button/button'
import DownBtn from '../../components/Chat/downBtn'
import MessageNotification from '../../components/Chat/messageNotification'
import { UserInfo } from '../../types/index'
import SendIcon from '@mui/icons-material/Send'

const BackgroundWrapper = styled.div`
  background-color: #f8faff;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1; /* ChatContainer가 좌우 사이드바 사이의 모든 공간을 채우도록 설정 */
  max-width: calc(
    100% - 36rem
  ); /* 좌우 사이드바의 합산 너비(16rem + 20rem)를 뺀 나머지 공간을 차지 */
  padding-top: 60px;
  background-color: ${(props) => props.theme.backgroundColor || '#ffffff'};
  position: relative;
  overflow: hidden;
  margin: 0 auto; /* 가운데 정렬 */
  border-left: 1px solid rgba(160, 160, 160, 0.5);
  border-right: 1px solid rgba(160, 160, 160, 0.5);
  right: 0.8rem;
`

const ChatRoomFakeBlank = styled.div`
  height: 100%;
  width: 1rem;
  display: flex;
  border-left: 1px solid rgba(160, 160, 160, 0.5);
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  height: 60px;
  border-bottom: 1px solid #ccc;
  background-color: #f8faff;
  position: fixed;
  top: 0;
  width: 100%;
  max-width: calc(100% - 36.15rem);
`

const Title = styled.h1`
  font-size: 1.35rem;
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
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
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
  width: 4rem;
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

// const NewMessageButton = styled.button<{ show: boolean }>`
//   position: absolute;
//   bottom: 80px;
//   left: 50%;
//   transform: translateX(-50%);
//   padding: 10px 20px;
//   background-color: rgba(248, 250, 255, 0.7);
//   color: #151515;
//   border: 1px solid;
//   border-radius: 4px;
//   cursor: pointer;
//   display: ${(props) => (props.show ? 'block' : 'none')};

//   &:hover {
//     background-color: #f8faff;
//   }
// `

const StyledButton = styled(Button)`
  background-color: #9269b2;

  &:hover {
    background-color: #7a5597;
  }

  color: white; /* 버튼 글자 색상 */
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`

const ChattingPage: React.FC = () => {
  const { chatRoomId } = useParams<{ chatRoomId: string }>()
  const { chatRooms, messages, setMessages } = useChat()
  const { theme } = useApp()
  const token = localStorage.getItem('token') || ''
  const nickname = localStorage.getItem('nickname') || ''
  const { subscribeToChatRoom } = useChatWebSocket()
  const messageListRef = useRef<HTMLUListElement>(null)
  const navigate = useNavigate()

  const [messageContent, setMessageContent] = useState('')
  const { isOpen, open, close } = useModal()

  const roomId: number | null = chatRoomId ? parseInt(chatRoomId, 10) : null
  const chatRoom = chatRooms.find((room) => room.chatRoomId === roomId)

  const [showDownButton, setShowDownButton] = useState(false) // Down 버튼 상태 추가
  const [newMessage, setNewMessage] = useState('') // 새로운 메시지 상태 추가
  const [newMessageUser, setNewMessageUser] = useState<UserInfo | null>(null) // 새로운 메시지 보낸 사용자 상태 추가
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false) // 모달 상태 추가

  // 스크롤 이벤트 핸들러 추가
  const handleScroll = () => {
    if (messageListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageListRef.current
      const isScrolledToBottom =
        Math.abs(scrollHeight - scrollTop - clientHeight) < 250
      setShowDownButton(!isScrolledToBottom) // 스크롤이 최하단이면 버튼 숨기기, 아니면 버튼 표시
      if (!isScrolledToBottom) {
        saveScrollPosition()
        setShowDownButton(false)
      }
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

  // 메시지 전송
  const sendMessage = async () => {
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
      setTimeout(() => scrollToBottom(), 100) // 메시지를 보낸 후 최하단으로 스크롤
    } else {
      console.error('StompClient is not connected.')
    }
  }

  // 최하단으로 스크롤 기능 함수
  const scrollToBottom = () => {
    if (messageListRef.current) {
      requestAnimationFrame(() => {
        messageListRef.current!.scrollTop = messageListRef.current!.scrollHeight
      })
    }
  }

  // 메시지 수신 시 'useEffect' 훅에 새 메시지 버튼 표시 로직
  useEffect(() => {
    if (messageListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageListRef.current
      const isScrolledToBottom =
        Math.abs(scrollHeight - scrollTop - clientHeight) < 250

      if (
        !isScrolledToBottom &&
        messages[messages.length - 1]?.sender !== nickname
      ) {
        setNewMessage(messages[messages.length - 1]?.content || '') // 새 메시지 설정
        setNewMessageUser(
          chatRoom?.userResponses.find(
            (user) =>
              user.userNickname === messages[messages.length - 1]?.sender
          ) || null
        ) // 새 메시지 보낸 사용자 설정
        setShowDownButton(true) // Down 버튼 표시
      } else {
        scrollToBottom()
        setShowDownButton(false) // Down 버튼 숨기기
      }
    }
  }, [messages, nickname, chatRoom])

  // 채팅방 초대 함수
  const inviteToChatRoom = (selectedNicknames: string[]) => {
    const payload = {
      chatRoomId: roomId,
      nicknames: selectedNicknames,
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
    close()
  }

  // 채팅방 나가기 함수
  const leaveChatRoom = () => {
    if (roomId === null) return
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
    getRecentMessages()
    restoreScrollPosition()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
      saveScrollPosition()
      setMessages([])
    }
  }, [roomId])

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

  const handleProfileClick = (nickname: string) => {
    navigate(`/user/${nickname}?tab=posts`)
  }

  // 프로필 이미지를 결정하는 부분 수정
  // let displayProfileImages: string[] = []
  // if (chatRoom.userResponses.length === 1) {
  //   displayProfileImages = ['default_profile_image_url'] // 1명일 경우 디폴트 이미지 설정
  // } else {
  //   displayProfileImages = chatRoom.userResponses
  //     .filter((user) => user.userNickname !== nickname)
  //     .map((user) => user.profileImageUrl || 'default_profile_image_url') // 프로필 이미지가 없는 경우 디폴트 이미지 설정
  // }

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
    <BackgroundWrapper>
      <ChatContainer>
        <Header>
          <Title>{displayName}</Title>
          <ButtonContainer>
            <ActionButton onClick={open}>
              <AddMemberIcon theme={theme} />
            </ActionButton>
            {isOpen && (
              <AddUserModal
                isOpen={isOpen}
                onClose={close}
                showCloseButton={false}
                handleSubmit={inviteToChatRoom}
                theme={theme}
              />
            )}
            <ActionButton onClick={() => setIsLeaveModalOpen(true)}>
              <ExitIcon theme={theme} />
            </ActionButton>
          </ButtonContainer>
        </Header>
        {/* 나가기 확인 모달 */}
        {isLeaveModalOpen && (
          <Modal
            isOpen={isLeaveModalOpen}
            onClose={() => setIsLeaveModalOpen(false)}
            showCloseButton={false}
          >
            <div style={{ textAlign: 'center' }}>
              <h3>채팅방에서 나가시겠습니까?</h3>
              <p>
                확인을 클릭할 시, 해당 채팅방에 더 이상 접근이 불가능해집니다.
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                  marginTop: '20px',
                }}
              >
                <StyledButton
                  onClick={() => {
                    leaveChatRoom()
                    setIsLeaveModalOpen(false)
                    navigate('/chat') // 채팅방 목록으로 이동
                  }}
                >
                  확인
                </StyledButton>
                <StyledButton onClick={() => setIsLeaveModalOpen(false)}>
                  취소
                </StyledButton>
              </div>
            </div>
          </Modal>
        )}
        <MessageList ref={messageListRef} onScroll={handleScroll}>
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
                  onAvatarClick={() => handleProfileClick(msg.sender)}
                />
              </MessageItem>
            )
          })}
        </MessageList>
        <InputContainer>
          <InputField
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="메시지를 입력하세요"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                sendMessage()
              }
            }}
          />
          <SendButton onClick={sendMessage}>
            <SendIcon />
          </SendButton>
        </InputContainer>
        {/* Down 버튼 추가 */}
        {showDownButton && <DownBtn onDownClick={scrollToBottom} />}
        {/* 메시지 알림 추가 */}
        {showDownButton && newMessageUser && (
          <MessageNotification
            msg={newMessage}
            user={newMessageUser}
            onDownClick={scrollToBottom}
          />
        )}
      </ChatContainer>
      <ChatRoomFakeBlank />
    </BackgroundWrapper>
  )
}
export default ChattingPage
