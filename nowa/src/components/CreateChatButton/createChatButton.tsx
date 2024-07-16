import React, { useState } from 'react'
import styled from 'styled-components'
import { CreateChatButtonIcon } from '../icons/icons'
import useModal from '@/hooks/modal'

interface CreateChatButtonProps {
  theme: 'light' | 'dark'
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

const ModalContent: React.FC<{ close: () => void }> = ({ close }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

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

  const handleCreateChat = () => {
    console.log('Create chat with members:', selectedMembers)
    close()
  }

  return (
    <div className="modal-box">
      <h3 className="font-bold text-lg">새 채팅방 만들기</h3>
      <input
        type="text"
        placeholder="멤버 검색"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="input input-bordered w-full my-2"
      />
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
      <div className="modal-action">
        <button className="btn" onClick={handleCreateChat}>
          채팅방 생성
        </button>
        <button className="btn" onClick={close}>
          Close
        </button>
      </div>
    </div>
  )
}

const CreateChatButton: React.FC<CreateChatButtonProps> = ({ theme }) => {
  const { isOpen, open, close } = useModal()

  return (
    <>
      <Button onClick={open}>
        <CreateChatButtonIcon theme={theme} />
      </Button>
      {isOpen && (
        <dialog open={isOpen} className="modal">
          <ModalContent close={close} />
        </dialog>
      )}
    </>
  )
}

export default CreateChatButton
