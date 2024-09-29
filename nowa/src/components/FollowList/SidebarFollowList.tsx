// SideFollowList.tsx

import React from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'

interface LoginActiveProps {
  active: boolean
}

const SideFollowListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  max-height: 80vh;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
`

const SideFollowItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
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
  margin-right: 15px;
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

interface SideFollowListProps {
  users: {
    isFollowing: boolean
    name: string
    nickname: string
    profileImageUrl: string
    active: string
  }[]
  searchQuery: string
}

const SideFollowList: React.FC<SideFollowListProps> = ({
  users,
  searchQuery,
}) => {
  const navigate = useNavigate()

  const filteredList = searchQuery
    ? users
        .filter((user) =>
          user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          // active에 따른 정렬
          if (a.active === 'true' && b.active !== 'true') return -1
          if (a.active !== 'true' && b.active === 'true') return 1

          // 같은 active 상태일 경우 한글, 영어 순서로 정렬
          const isAEnglish = /^[a-zA-Z]/.test(a.nickname)
          const isBEnglish = /^[a-zA-Z]/.test(b.nickname)

          if (isAEnglish && !isBEnglish) return 1 // 영어를 뒤로 보냄
          if (!isAEnglish && isBEnglish) return -1 // 한글을 앞으로 보냄

          // 같은 언어일 경우 사전순 정렬
          return a.nickname.localeCompare(b.nickname)
        })
    : users.sort((a, b) => {
        // active에 따른 정렬
        if (a.active === 'true' && b.active !== 'true') return -1
        if (a.active !== 'true' && b.active === 'true') return 1

        // 같은 active 상태일 경우 한글, 영어 순서로 정렬
        const isAEnglish = /^[a-zA-Z]/.test(a.nickname)
        const isBEnglish = /^[a-zA-Z]/.test(b.nickname)

        if (isAEnglish && !isBEnglish) return 1 // 영어를 뒤로 보냄
        if (!isAEnglish && isBEnglish) return -1 // 한글을 앞으로 보냄

        // 같은 언어일 경우 사전순 정렬
        return a.nickname.localeCompare(b.nickname)
      })

  const handleProfileClick = (nickname: string) => {
    navigate(`/user/${nickname}?tab=posts`)
  }

  return (
    <SideFollowListWrapper>
      {filteredList.map((user, index) => (
        <SideFollowItem key={index}>
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
        </SideFollowItem>
      ))}
    </SideFollowListWrapper>
  )
}

export default SideFollowList
