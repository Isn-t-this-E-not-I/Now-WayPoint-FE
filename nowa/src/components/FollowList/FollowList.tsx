import React from 'react'
import styled from 'styled-components'
import Button from '../Button/button'
import { useNavigate } from 'react-router-dom'

const FollowListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 2rem;
`

const FollowItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
`

const FollowName = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`

const FollowDetails = styled.div`
  display: flex;
  flex-direction: column;
`

const Nickname = styled.div`
  font-size: 0.9rem;
`

const UserName = styled.div`
  font-size: 0.8rem;
  color: #555;
`

const LoginActive = styled.div`
  width: 45px;
  height: 25px;
`

interface FollowListProps {
  users: {
    isFollowing: boolean
    name: string
    nickname: string
    profileImageUrl: string
    active: string
  }[]
  searchQuery: string
  onFollow: (nickname: string) => void
  onUnfollow: (nickname: string) => void
  showFollowButtons: boolean
}

const FollowList: React.FC<FollowListProps> = ({
  users,
  searchQuery,
  onFollow,
  onUnfollow,
  showFollowButtons,
}) => {
  const navigate = useNavigate()

  const filteredList = searchQuery
    ? users.filter((user) =>
        user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users

  const handleProfileClick = (nickname: string) => {
    navigate(`/user/${nickname}?tab=posts`)
  }

  return (
    <FollowListWrapper>
      {filteredList.map((user, index) => {
        return (
          <FollowItem key={index}>
            <FollowName onClick={() => handleProfileClick(user.nickname)}>
              <ProfileImage
                src={user.profileImageUrl || '/defaultprofile.png'}
                alt="Profile"
              />
              <FollowDetails>
                <Nickname>{user.nickname}</Nickname>
                <UserName>@{user.name}</UserName>
                {/* <LoginActive>{user.active}</LoginActive> */}
              </FollowDetails>
            </FollowName>
            {showFollowButtons && (
              <Button
                className={user.isFollowing ? 'btn-secondary' : 'btn-primary'}
                onClick={() =>
                  user.isFollowing
                    ? onUnfollow(user.nickname)
                    : onFollow(user.nickname)
                }
              >
                {user.isFollowing ? '언팔로우' : '팔로우'}
              </Button>
            )}
          </FollowItem>
        )
      })}
    </FollowListWrapper>
  )
}

export default FollowList
