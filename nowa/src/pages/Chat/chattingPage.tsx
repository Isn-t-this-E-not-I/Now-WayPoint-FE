import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useChatWebSocket } from '@/websocket/chatWebSocket'
import { Form, useParams } from 'react-router-dom'
import { useApp } from '@/context/appContext'
import { useChat } from '../../context/chatContext'
import { getStompClient } from '@/websocket/chatWebSocket'
import useModal from '@/hooks/modal'
import Modal from '../../components/Modal/modal'
import {
  AddMemberIcon,
  ExitIcon,
  EditChatNameIcon,
} from '../../components/icons/icons'

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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 10px;
`

const Button = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
`

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 10px;
`

const SubmitButton = styled.button<{ $themeMode: string }>`
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  color: ${(props) => (props.$themeMode === 'dark' ? '#f7f7f7' : '#2d2e2f')};
  background-color: ${(props) =>
    props.$themeMode === 'dark' ? '#444' : '#fff'};

  &:hover {
    color: #2d2e2f;
    background-color: #ffeb6b;
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: -15px;
  right: -5px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #aaa;

  &:hover {
    color: #000;
  }

  &:focus {
    outline: none;
  }
`

const ChattingPage: React.FC = () => {
  const { chatRoomId } = useParams<{ chatRoomId: string }>()
  const { chatRooms, messages, setMessages } = useChat()
  const { theme } = useApp()
  const token = useState<string>(localStorage.getItem('token') || '')
  const { subscribeToChatRoom } = useChatWebSocket()
  const {
    isOpen: isInviteOpen,
    open: openInvite,
    close: closeInvite,
  } = useModal()
  const { isOpen: isExitOpen, open: openExit, close: closeExit } = useModal()
  const { isOpen: isEditOpen, open: openEdit, close: closeEdit } = useModal()
  const [newChatRoomName, setNewChatRoomName] = useState<string>('')
  const [selectedUsers, setSelectedUsers] = useState<string>('')

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

  // 채팅방 초대 함수
  const handleInviteUsers = (e: React.FormEvent) => {
    e.preventDefault()
    const nicknames = selectedUsers.split(',').map((user) => user.trim())
    const stompClient = getStompClient()
    const payload = { chatRoomId: roomId, nicknames }

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
    closeInvite()
  }

  // 채팅방 나가기 함수
  const handleExitChatRoom = () => {
    const stompClient = getStompClient()
    const payload = { chatRoomId: roomId }

    if (stompClient) {
      stompClient.publish({
        destination: '/app/chatRoom/leave',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
    } else {
      console.error('StompClient is not connected.')
    }

    closeExit()
  }

  // 채팅방명 수정 함수
  const handleEditChatRoomName = (e: React.FormEvent) => {
    e.preventDefault()
    const stompClient = getStompClient()
    const payload = { chatRoomId: roomId, newChatRoomName }

    if (stompClient) {
      stompClient.publish({
        destination: '/app/chatRoom/updateName',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
    } else {
      console.error('StompClient is not connected.')
    }

    setNewChatRoomName('')
    closeEdit()
  }

  return (
    <ChatContainer>
      <h2>{chatRoom.chatRoomName}</h2>
      <ButtonGroup>
        <Button onClick={openInvite}>
          <AddMemberIcon theme={theme} />
        </Button>
        <Button onClick={openExit}>
          <ExitIcon theme={theme} />
        </Button>
        <Button onClick={openEdit}>
          <EditChatNameIcon theme={theme} />
        </Button>
      </ButtonGroup>
      <MessageList>
        {messages.map((msg, index) => (
          <MessageItem key={index}>
            <strong>{msg.sender}: </strong>
            {msg.content}
          </MessageItem>
        ))}
      </MessageList>

      {/* 초대 모달 */}
      {isInviteOpen && (
        <Modal
          isOpen={isInviteOpen}
          onClose={closeInvite}
          showCloseButton={false}
        >
          <div style={{ position: 'relative' }}>
            <CloseButton onClick={closeInvite}>&times;</CloseButton>
            <h3>유저 초대</h3>
            <Form onSubmit={handleInviteUsers}>
              <Input
                type="text"
                value={selectedUsers}
                onChange={(e) => setSelectedUsers(e.target.value)}
                placeholder="초대할 유저 닉네임 (쉼표로 구분)"
              />
              <SubmitButton type="submit" $themeMode={theme}>
                초대
              </SubmitButton>
            </Form>
          </div>
        </Modal>
      )}

      {/* 나가기 모달 */}
      {isExitOpen && (
        <Modal isOpen={isExitOpen} onClose={closeExit} showCloseButton={false}>
          <div style={{ position: 'relative' }}>
            <CloseButton onClick={closeExit}>&times;</CloseButton>
            <h3>채팅방 나가기</h3>
            <p>정말로 이 채팅방을 나가시겠습니까?</p>
            <SubmitButton onClick={handleExitChatRoom} $themeMode={theme}>
              나가기
            </SubmitButton>
          </div>
        </Modal>
      )}

      {/* 채팅방명 수정 모달 */}
      {isEditOpen && (
        <Modal isOpen={isEditOpen} onClose={closeEdit} showCloseButton={false}>
          <div style={{ position: 'relative' }}>
            <CloseButton onClick={closeEdit}>&times;</CloseButton>
            <h3>채팅방 이름 수정</h3>
            <Form onSubmit={handleEditChatRoomName}>
              <Input
                type="text"
                value={newChatRoomName}
                onChange={(e) => setNewChatRoomName(e.target.value)}
                placeholder="새 채팅방 이름"
              />
              <SubmitButton type="submit" $themeMode={theme}>
                수정
              </SubmitButton>
            </Form>
          </div>
        </Modal>
      )}
    </ChatContainer>
  )
}

export default ChattingPage
