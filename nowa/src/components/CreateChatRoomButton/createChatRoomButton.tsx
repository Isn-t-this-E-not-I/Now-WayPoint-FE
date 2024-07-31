import React, { useState } from 'react'
import styled from 'styled-components'
import { CreateChatButtonIcon } from '../icons/icons'
import useModal from '@/hooks/modal'
import Modal from '../Modal/modal'
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
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

const CreateChatRoomButton: React.FC = () => {
  const { theme } = useApp();
  const { isOpen, open, close } = useModal()
  const [selectedUsers, setSelectedUsers] = useState<string>('')
  const token = useState<string>(localStorage.getItem('token') || '');

  const handleCreateChat = (e: React.FormEvent) => {
    e.preventDefault()
    const nicknames = selectedUsers.split(',').map((user) => user.trim())
    const stompClient = getStompClient();
    const payload = { nicknames }

    // STOMP 클라이언트를 통해 서버에 메시지 전송
    if (stompClient) {
      stompClient.publish({
        destination: '/app/chatRoom/create',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
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
        <Modal isOpen={isOpen} onClose={close} showCloseButton={false}>
          <div style={{ position: 'relative' }}>
            <CloseButton onClick={close}>&times;</CloseButton>
            <h3 className="font-bold text-lg">새 채팅방 생성</h3>
            <Form onSubmit={handleCreateChat}>
              <Input
                type="text"
                value={selectedUsers}
                onChange={(e) => setSelectedUsers(e.target.value)}
                placeholder="초대할 유저 닉네임 (쉼표로 구분)"
              />
              <SubmitButton type="submit" $themeMode={theme}>
                생성
              </SubmitButton>
            </Form>
          </div>
        </Modal>
      )}
    </>
  )
}

export default CreateChatRoomButton