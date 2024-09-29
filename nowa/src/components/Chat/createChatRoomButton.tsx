import React from 'react'
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
  position: relative;

  &:focus {
    outline: none;
  }

  &:hover > div {
    opacity: 1;
    visibility: visible;
  }
`

const Tooltip = styled.div`
  position: absolute;
  top: 90%;
  left: 50%;
  transform: translate(-50%);
  background-color: #333;
  color: #fff;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.2s,
    visibility 0.2s;
  z-index: 1;
`

const CreateChatRoomButton: React.FC = () => {
  const { theme } = useApp()
  const { isOpen, open, close } = useModal()
  const token = localStorage.getItem('token') || ''

  const handleCreateChat = (selectedNicknames: string[]) => {
    const stompClient = getStompClient()
    const payload = { nicknames: selectedNicknames }

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
    close()
  }

  return (
    <>
      <Button onClick={open}>
        <CreateChatButtonIcon theme={theme} />
        <Tooltip>새 메시지</Tooltip>
      </Button>
      {isOpen && (
        <InviteModal
          isOpen={isOpen}
          onClose={close}
          showCloseButton={false}
          handleSubmit={handleCreateChat}
          theme={theme}
        />
      )}
    </>
  )
}

export default CreateChatRoomButton
