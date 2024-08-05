import React, { useState } from 'react'
import styled from 'styled-components'
import { CreateChatButtonIcon } from '../icons/icons'
import useModal from '@/hooks/modal'
import InviteModal from '../Modal/inviteModal'
import { getStompClient } from '@/websocket/chatWebSocket'
import { useApp } from '@/context/appContext'

const Button = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    outline: none;
  }
`

const CreateChatRoomButton: React.FC = () => {
  const { theme } = useApp()
  const { isOpen, open, close } = useModal()
  const [selectedUsers, setSelectedUsers] = useState<string>('')
  const token = localStorage.getItem('token') || ''

  const handleCreateChat = (e: React.FormEvent) => {
    e.preventDefault()
    const nicknames = selectedUsers.split(',').map((user) => user.trim())
    const stompClient = getStompClient()
    const payload = { nicknames }

    // STOMP 클라이언트를 통해 서버에 메시지 전송
    if (stompClient) {
      stompClient.publish({
        destination: '/app/chatRoom/create',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
    } else {
      console.error('StompClient is not connected.')
    }

    // 입력 필드 초기화 및 모달 닫기
    setSelectedUsers('')
    close()
  }

  return (
    <>
      <Button onClick={open}>
        <CreateChatButtonIcon theme={theme} />
      </Button>
      {isOpen && (
        <InviteModal
          isOpen={isOpen}
          onClose={close}
          showCloseButton={false}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          handleSubmit={handleCreateChat}
          theme={theme}
        />
      )}
    </>
  )
}

export default CreateChatRoomButton
