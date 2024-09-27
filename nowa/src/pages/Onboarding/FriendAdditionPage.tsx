import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllUsers, addFollow } from '../../api/userApi'
import Button from '../../components/Button/button'
import TextInput from '../../components/TextInput/textInput'
import './styles.css'
import { FaPlus, FaCheck } from 'react-icons/fa'

interface User {
  name: string
  nickname: string
  profileImageUrl: string
}

const FriendAdditionPage: React.FC = () => {
  const [showFriendPrompt, setShowFriendPrompt] = useState(true)
  const [transitioning, setTransitioning] = useState(false)
  const [completedTransition, setCompletedTransition] = useState(false)
  const [, setNickname] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedFriends, setSelectedFriends] = useState<User[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const storedNickname = localStorage.getItem('nickname')
    if (storedNickname) {
      setNickname(storedNickname)
    }
  }, [])

  useEffect(() => {
    const fetchSearchResults = async () => {
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
              user.name.includes(searchQuery) ||
              user.nickname.includes(searchQuery)
          )
          setSearchResults(results)
        } else {
          console.error('No token found')
        }
      } catch (error) {
        console.error('Error searching users:', error)
      }
    }

    fetchSearchResults()
  }, [searchQuery]) // searchQuery가 변경될 때마다 실행

  const handleFindFriends = () => {
    setTransitioning(true)
    setTimeout(() => {
      setShowFriendPrompt(false)
      setTransitioning(false)
      setCompletedTransition(true)
    }, 1000)
  }

  const handleSkip = () => {
    navigate('/onboarding/distance-add')
  }

  const handleAddFriend = (friend: User) => {
    setSelectedFriends([...selectedFriends, friend])
    setSearchResults(
      searchResults.filter((user) => user.nickname !== friend.nickname)
    )
  }

  const handleRemoveFriend = (nickname: string) => {
    const removedFriend = selectedFriends.find(
      (friend) => friend.nickname === nickname
    )
    if (removedFriend) {
      setSelectedFriends(
        selectedFriends.filter((friend) => friend.nickname !== nickname)
      )
      setSearchResults([...searchResults, removedFriend])
    }
  }

  const handleAddFollow = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await Promise.all(
          selectedFriends.map((friend) => addFollow(token, friend.nickname))
        )
        navigate('/onboarding/distance-add')
      } else {
        console.error('No token found')
      }
    } catch (error) {
      console.error('Error adding follow:', error)
    }
  }

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-image">
      {showFriendPrompt ? (
        <div
          className={`flex flex-col items-center justify-center min-h-screen transition-all transform ${transitioning ? 'translate-x-full' : 'translate-x-0'}`}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            환영합니다, 이제 친구를 찾아볼까요?
          </h2>
          <Button
            className="btn-primary text-base mt-16 w-64 h-14 bg-yellow-300 text-black hover:bg-yellow-400 border-none"
            onClick={handleFindFriends}
          >
            친구 선택하기
          </Button>
          <Button
            className="btn-primary text-base mt-4 w-64 h-14 bg-white text-black hover:bg-gray-200 border-none"
            onClick={handleSkip}
          >
            건너뛰기
          </Button>
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center min-h-screen transition-all transform ${completedTransition ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <h2 className="text-xl font-bold mb-12 text-gray-800">
            친구의 닉네임을 검색하세요
          </h2>
          <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg overflow-hidden">
            <div className="flex mb-4">
              <TextInput
                type="text"
                placeholder="친구 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // 입력할 때마다 searchQuery 업데이트
                className="flex-grow border-gray-300 p-4 ml-2 mr-40 rounded-200 focus:outline-none"
              />
            </div>
            <ul className="mb-4 w-full">
              {searchResults.map((user: User) => (
                <li
                  key={user.nickname}
                  className="flex items-center justify-between ml-2 mr-1 p-4 bg-gray-50 rounded-lg mb-2"
                >
                  <div className="flex items-center">
                    <img
                      src={user.profileImageUrl}
                      alt={user.name}
                      className="w-10 h-10 rounded-full mr-4"
                    />
                    <div>
                      <p className="text-black text-sm">{user.nickname}</p>
                      <p className="text-gray-500 text-sm ml-0.5">
                        {user.name}
                      </p>
                    </div>
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
            <Button
              className="btn-primary text-base h-10 w-full ml-2 mr-2 rounded-lg bg-yellow-300 text-black hover:bg-yellow-400 border-none"
              onClick={handleAddFollow}
            >
              친구 {selectedFriends.length}명 추가
            </Button>
            {selectedFriends.length > 0 && (
              <div className="mt-4 ml-2">
                <ul>
                  {selectedFriends.map((friend: User) => (
                    <li
                      key={friend.nickname}
                      className="flex items-center justify-between p-4 bg-gray-100 rounded-lg mb-2"
                    >
                      <div className="flex items-center">
                        <img
                          src={friend.profileImageUrl}
                          alt={friend.name}
                          className="w-10 h-10 rounded-full mr-4"
                        />
                        <div>
                          <p className="text-black text-sm">
                            {friend.nickname}
                          </p>
                          <p className="text-gray-500 text-sm ml-0.5">
                            {friend.name}
                          </p>
                        </div>
                      </div>
                      <FaCheck
                        onClick={() => handleRemoveFriend(friend.nickname)}
                        className="text-green-500 cursor-pointer"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FriendAdditionPage
