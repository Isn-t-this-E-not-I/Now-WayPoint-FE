import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { FaPlus, FaCheck, FaTrash } from 'react-icons/fa'
import { getAllUsers } from '../../api/userApi'
import fetchAllUsers from '@/data/fetchAllUsers'

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

// const Label = styled.label`
//   font-weight: bold;
//   margin-top: 20px;
// `

// const Input = styled.input`
//   padding: 8px;
//   border: 1px solid #ccc;
//   border-radius: 4px;
//   margin-top: -4px;
//   margin-bottom: -10px;
// `

const SubmitButton = styled.button<{ $themeMode: string }>`
  padding: 8px;
  width: 80px;
  margin-left: 380px;
  border-radius: 5px;
  cursor: pointer;
  color: ${(props) => (props.$themeMode === 'dark' ? '#f7f7f7' : '#f7f7f7')};
  background-color: ${(props) =>
    props.$themeMode === 'dark' ? '#444' : '#9269b2'};

  &:hover {
    color: #f7f7f7;
    background-color: #7a5597;
  }
  margin-top: 10px;
`

const SearchContainer = styled.div`
  margin-left: -1px;
  width: 100%;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
`

const SelectedFriendsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
`

const FriendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f0f0;
  padding: 8px;
  border-radius: 4px;
`

const FriendImage = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
`

const FriendName = styled.p`
  font-size: 14px;
  margin: 0;
`

const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #ff0000;
  font-size: 16px;
`

interface User {
  name: string
  nickname: string
  profileImageUrl: string
}

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  handleSubmit: (selectedNicknames: string[]) => void
  theme: string
  showCloseButton?: boolean
}

const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  handleSubmit,
  theme,
  showCloseButton = true,
}) => {
  const [, setAllUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedFriends, setSelectedFriends] = useState<User[]>([])
  const nickname = localStorage.getItem('nickname') || ''

  // const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(e.target.value)
  // }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
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

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery) {
        setSearchResults([])
        return
      }

      try {
        const token = localStorage.getItem('token')
        if (token) {
          const users = await getAllUsers(token)
          const results = users.filter(
            (user: User) =>
              (user.name.includes(searchQuery) ||
                user.nickname.includes(searchQuery)) &&
              !selectedFriends.some(
                (selected) => selected.nickname === user.nickname
              )
          )
          setSearchResults(results)
        } else {
          console.error('No token found')
        }
      } catch (error) {
        console.error('Error searching users:', error)
      }
    }

    searchUsers()
  }, [searchQuery, selectedFriends])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setSearchQuery(event.currentTarget.value)
    }
  }

  const handleAddFriend = (friend: User) => {
    setSelectedFriends([...selectedFriends, friend])
    setSearchQuery('')
  }

  const handleRemoveFriend = (nickname: string) => {
    setSelectedFriends(
      selectedFriends.filter((friend) => friend.nickname !== nickname)
    )
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedNicknames = selectedFriends.map((friend) => friend.nickname)

    handleSubmit(selectedNicknames)
  }

  if (!isOpen) return null

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalBox>
        <div style={{ position: 'relative' }}>
          <CloseButton onClick={onClose}>&times;</CloseButton>
          <h3 className="font-bold text-lg">새 채팅방 생성</h3>
          <Form onSubmit={handleFormSubmit}>
            <SelectedFriendsContainer>
              {selectedFriends.map((friend) => (
                <FriendItem key={friend.nickname}>
                  <FriendImage src={friend.profileImageUrl} alt={friend.name} />
                  <FriendName>{friend.nickname}</FriendName>
                  <RemoveButton
                    onClick={() => handleRemoveFriend(friend.nickname)}
                  >
                    <FaTrash />
                  </RemoveButton>
                </FriendItem>
              ))}
            </SelectedFriendsContainer>
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="친구 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </SearchContainer>
            <ul className="mb-4">
              {searchResults
                .filter((user) => user.nickname !== nickname)
                .map((user: User) => (
                  <li
                    key={user.nickname}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-2"
                  >
                    <div className="flex items-center">
                      <img
                        src={user.profileImageUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-full mr-4"
                      />
                      <p className="text-black">{user.nickname}</p>
                      <p className="text-gray-500 ml-0.5">({user.name})</p>
                    </div>
                    {selectedFriends.some(
                      (friend) => friend.nickname === user.nickname
                    ) ? (
                      <FaCheck
                        onClick={() => handleRemoveFriend(user.nickname)}
                        className="text-green-500 cursor-pointer"
                      />
                    ) : (
                      <FaPlus
                        onClick={() => handleAddFriend(user)}
                        className="text-blue-500 cursor-pointer"
                      />
                    )}
                  </li>
                ))}
            </ul>
            <SubmitButton
              type="submit"
              $themeMode={theme}
              disabled={selectedFriends.length === 0}
            >
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
