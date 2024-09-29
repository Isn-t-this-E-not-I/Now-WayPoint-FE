import React from 'react'
import Button from '../../components/Button/button'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'

interface LoginActiveProps {
  active: boolean
}

const FollowListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap; /* 줄 바꿈 허용 */
  justify-content: flex-start;
  margin-left: -0.3rem;
  max-height: 80vh;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
`

const FollowItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  width: calc(50% - 20px); /* 두 개의 아이템이 한 줄에 들어가도록 설정 */
  box-sizing: border-box; /* 패딩과 너비가 겹치지 않도록 설정 */
  margin-bottom: 10px;
`

const FollowName = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
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

const LoginActive = styled.div<LoginActiveProps>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.active ? '#56BD70' : 'rgb(168, 168, 168)'};
  margin-top: 4px;
  margin-left: 4px;
`

const LoginActiveContainer = styled.div`
  position: absolute;
  left: 24px;
  bottom: -4px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  margin: 0 auto;
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
}

const UserFollowList: React.FC<FollowListProps> = ({
  users,
  searchQuery,
  onFollow,
  onUnfollow,
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
      {filteredList.map((user, index) => (
        <FollowItem key={index}>
          <FollowName onClick={() => handleProfileClick(user.nickname)}>
            <ProfileImage
              src={user.profileImageUrl || '/defaultprofile.png'}
              alt="Profile"
            />
            <LoginActiveContainer>
              <LoginActive active={user.active === 'true'} />
            </LoginActiveContainer>
            <FollowDetails>
              <Nickname>{user.nickname}</Nickname>
              <UserName>@{user.name}</UserName>
            </FollowDetails>
          </FollowName>
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
        </FollowItem>
      ))}
    </FollowListWrapper>
  )
}

export default UserFollowList
