import React from 'react'
import styled from 'styled-components'
import { CreateChatButtonIcon } from '../icons/icons'
import useModal from '@/hooks/modal'
import ReusableModalContent from '../ReusableModalContent/reusableModalContent'
import Modal from '../Modal/modal'

interface CreateChatButtonProps {
  theme: 'light' | 'dark'
  onCreateChat: (newChatRoom: {
    id: number
    profilePic: string
    name: string
    lastMessage: string
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

const CreateChatButton: React.FC<CreateChatButtonProps> = ({
  theme,
  onCreateChat,
}) => {
  const { isOpen, open, close } = useModal()

  const handleCreateChat = (selectedMembers: string[]) => {
    const newChatRoom = {
      id: Date.now(),
      profilePic: 'https://via.placeholder.com/40',
      name: selectedMembers.join(', '),
      lastMessage: '새 채팅방이 생성되었습니다.',
    }
    onCreateChat(newChatRoom)
    close()
  }

  return (
    <>
      <Button onClick={open}>
        <CreateChatButtonIcon theme={theme} />
      </Button>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={close} showCloseButton={false}>
          <ReusableModalContent
            close={close}
            title="새 채팅방 생성"
            onConfirm={handleCreateChat}
          />
        </Modal>
      )}
    </>
  )
}

export default CreateChatButton
