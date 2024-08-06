import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import fetchAllUsers from '@/data/fetchAllUsers'
import AllUserList from '../FollowList/AllUserList'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalBox = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  position: relative;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Label = styled.label`
  font-weight: bold;
  margin-top: 20px;
`

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: -4px;
  margin-bottom: -10px;
`

const SubmitButton = styled.button<{ $themeMode: string }>`
  padding: 8px;
  width: 80px;
  margin-left: 380px;
  border-radius: 5px;
  cursor: pointer;
  color: ${(props) => (props.$themeMode === 'dark' ? '#f7f7f7' : '#2d2e2f')};
  background-color: ${(props) =>
    props.$themeMode === 'dark' ? '#444' : 'lightblue'};

  &:hover {
    color: #2d2e2f;
    background-color: #ffeb6b;
  }
  margin-top: 10px;
`
const SearchContainer = styled.div`
  margin-left: 6px;
  width: 100%;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
`

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  selectedUsers: string
  setSelectedUsers: React.Dispatch<React.SetStateAction<string>>
  handleSubmit: (e: React.FormEvent) => void
  theme: string
  showCloseButton?: boolean
}

const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  selectedUsers,
  setSelectedUsers,
  handleSubmit,
  theme,
  showCloseButton = true,
}) => {
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  useEffect(() => {
    const getAllUsers = async () => {
      const users = await fetchAllUsers()
      setAllUsers(users)
    }
    getAllUsers()
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <Overlay>
      <ModalBox>
        <div style={{ position: 'relative' }}>
          <CloseButton onClick={onClose}>&times;</CloseButton>
          <h3 className="font-bold text-lg">새 채팅방 생성</h3>
          <Form onSubmit={handleSubmit}>
            <Label htmlFor="invitedUsers">유저 초대</Label>
            {/* <SearchContainer>
              <SearchInput
                type="text"
                placeholder="전체 유저 검색"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <AllUserList
                users={allUsers}
                searchQuery={searchQuery}
              />
            </SearchContainer> */}
            <Input
              type="text"
              value={selectedUsers}
              onChange={(e) => setSelectedUsers(e.target.value)}
              placeholder="유저 닉네임 입력"
            />
            <SubmitButton type="submit" $themeMode={theme}>
              생성
            </SubmitButton>
          </Form>
        </div>
        {showCloseButton && (
          <div className="modal-action">
            <button className="btn" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </ModalBox>
    </Overlay>
  )
}

export default InviteModal
