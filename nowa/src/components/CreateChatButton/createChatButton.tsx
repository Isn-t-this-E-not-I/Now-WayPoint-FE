import React, { useState } from 'react'
import styled from 'styled-components'
import { CreateChatButtonIcon } from '../icons/icons'
import useModal from '@/hooks/modal'
import Modal from '../Modal/modal'
import { createChatRoom as websocketCreateChatRoom } from '../../websocket/chatWebSocket'

interface CreateChatButtonProps {
  theme: 'light' | 'dark'
  token: string
  onCreateChat: (newChatRoom: {
    id: number
    profilePic: string
    name: string
    lastMessage: string
    memberCount: number
    messages: {
      avatarSrc: string
      header: string
      time: string
      message: string
      footer: string
      alignment: 'start' | 'end'
    }[]
  }) => void
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
`

const SubmitButton = styled.button<{ themeMode: string }>`
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  color: ${(props) => (props.themeMode === 'dark' ? '#f7f7f7' : '#2d2e2f')};
  background-color: ${(props) =>
    props.themeMode === 'dark' ? '#444' : '#fff'};

  &:hover {
    color: #2d2e2f;
    background-color: #ffeb6b;
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
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

const CreateChatButton: React.FC<CreateChatButtonProps> = ({
  theme,
  token,
  onCreateChat,
}) => {
  const { isOpen, open, close } = useModal()
  const [selectedMembers, setSelectedMembers] = useState<string>('')

  const handleCreateChat = (e: React.FormEvent) => {
    e.preventDefault()
    const members = selectedMembers.split(',').map((member) => member.trim())
    websocketCreateChatRoom(token, members)
    const newChatRoom = {
      id: Date.now(),
      profilePic: 'https://via.placeholder.com/40',
      name: members.join(', '),
      lastMessage: '새 채팅방이 생성되었습니다.',
      memberCount: members.length,
      messages: [],
    }
    onCreateChat(newChatRoom)
    setSelectedMembers('') // Clear input after confirm
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
                value={selectedMembers}
                onChange={(e) => setSelectedMembers(e.target.value)}
                placeholder="닉네임(들)"
              />
              <SubmitButton type="submit" themeMode={theme}>
                생성
              </SubmitButton>
            </Form>
          </div>
        </Modal>
      )}
    </>
  )
}

export default CreateChatButton
