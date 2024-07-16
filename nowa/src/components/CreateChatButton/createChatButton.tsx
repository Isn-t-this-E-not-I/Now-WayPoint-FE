import React, { useState } from 'react'
import styled from 'styled-components'
import { CreateChatButtonIcon } from '../icons/icons'
import useModal from '@/hooks/modal'

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

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;

  &:focus {
    outline: none;
  }
`

const ModalContentWrapper = styled.div`
  position: relative;
  padding: 20px;
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`

const ErrorMessage = styled.p`
  color: red;
  margin-top: 10px;
`

const SelectedMembersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  margin-bottom: 10px;
`

const SelectedMember = styled.div`
  display: flex;
  align-items: center;
  margin: 5px;
  padding: 5px 10px;
  background-color: #f1f1f1;
  border-radius: 5px;
`

const RemoveButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  margin-left: 5px;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`

const ModalContent: React.FC<{
  close: () => void
  onCreateChat: (newChatRoom: {
    id: number
    profilePic: string
    name: string
    lastMessage: string
  }) => void
}> = ({ close, onCreateChat }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [error, setError] = useState<string>('')

  const members = ['Alice', 'Bob', 'Charlie', 'David'] // 예시 멤버 리스트

  const filteredMembers = members.filter((member) =>
    member.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleMemberSelection = (member: string) => {
    setSelectedMembers((prevState) =>
      prevState.includes(member)
        ? prevState.filter((m) => m !== member)
        : [...prevState, member]
    )
  }

  const removeMember = (member: string) => {
    setSelectedMembers((prevState) => prevState.filter((m) => m !== member))
  }

  const handleCreateChat = () => {
    if (selectedMembers.length === 0) {
      setError('1명 이상 선택해야 합니다.')
    } else {
      const newChatRoom = {
        id: Date.now(), // 임시 ID 생성
        profilePic: 'https://via.placeholder.com/40',
        name: selectedMembers.join(', '),
        lastMessage: '새 채팅방이 생성되었습니다.',
      }
      onCreateChat(newChatRoom)
      close()
    }
  }

  return (
    <ModalContentWrapper>
      <h3 className="font-bold text-lg">새 채팅방 생성</h3>
      <SelectedMembersContainer>
        {selectedMembers.map((member) => (
          <SelectedMember key={member}>
            {member}
            <RemoveButton onClick={() => removeMember(member)}>
              &times;
            </RemoveButton>
          </SelectedMember>
        ))}
      </SelectedMembersContainer>
      <input
        type="text"
        placeholder="친구 검색"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="input input-bordered w-full my-2"
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <ul>
        {filteredMembers.map((member) => (
          <li key={member} className="flex justify-between items-center my-2">
            {member}
            <button
              className="btn btn-sm"
              onClick={() => toggleMemberSelection(member)}
            >
              {selectedMembers.includes(member) ? '선택 해제' : '선택'}
            </button>
          </li>
        ))}
      </ul>
      <div className="modal-action flex justify-end">
        <button className="btn" onClick={handleCreateChat}>
          채팅방 생성
        </button>
      </div>
      <CloseButton onClick={close}>&times;</CloseButton>
    </ModalContentWrapper>
  )
}

const CreateChatButton: React.FC<CreateChatButtonProps> = ({
  theme,
  onCreateChat,
}) => {
  const { isOpen, open, close } = useModal()

  return (
    <>
      <Button onClick={open}>
        <CreateChatButtonIcon theme={theme} />
      </Button>
      {isOpen && (
        <dialog open={isOpen} className="modal">
          <ModalContent close={close} onCreateChat={onCreateChat} />
        </dialog>
      )}
    </>
  )
}

export default CreateChatButton
