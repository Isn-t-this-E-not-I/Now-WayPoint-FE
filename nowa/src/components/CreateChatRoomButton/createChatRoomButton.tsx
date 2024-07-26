import React, { useState } from 'react'
import styled from 'styled-components'
import { CreateChatButtonIcon } from '../icons/icons'
import useModal from '@/hooks/modal'
import Modal from '../Modal/modal'
import { CompatClient } from '@stomp/stompjs'
import { ChatRoom } from '../../types'

interface CreateChatButtonProps {
  theme: 'light' | 'dark'
  token: string
  stompClient: CompatClient | null
  onCreateChat: (newChatRoom: ChatRoom) => void
}

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

const CreateChatRoomButton: React.FC<CreateChatButtonProps> = ({
  theme,
  token,
  stompClient,
  onCreateChat,
}) => {
  const { isOpen, open, close } = useModal()
  const [selectedMembers, setSelectedMembers] = useState<string>('')

  const handleCreateChat = (e: React.FormEvent) => {
    e.preventDefault()
    const members = selectedMembers.split(',').map((member) => member.trim())

    const payload = { members }

    if (stompClient) {
      // STOMP 클라이언트를 통해 서버에 메시지 전송
      stompClient.send(
        '/app/chatRoom/create',
        { Authorization: `Bearer ${token}` },
        JSON.stringify(payload)
      )

      // 입력 필드 초기화 및 모달 닫기
      setSelectedMembers('')
      close()
    } else {
      console.error('STOMP 클라이언트가 연결되어 있지 않습니다.')
    }
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
                value={selectedMembers}
                onChange={(e) => setSelectedMembers(e.target.value)}
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
