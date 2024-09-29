import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import axios from 'axios'
import styled from 'styled-components'
import defaultProfileImage from '../../../defaultprofile.png'
import Posts from '../components/Posts/Posts'
import UserFollowList from '../components/FollowList/UserFollowList'
import { getCommentsByPostId } from '../services/comments'
import Button from '../components/Button/button'
import { useChatWebSocket, getStompClient } from '@/websocket/chatWebSocket'
import { useChat } from '../context/chatContext'
import { fetchChatRooms } from '../api/chatApi'

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100vh;
  width: 67%;
  padding: 20px;
  padding-top: 3rem;
  margin-left: 15rem;
`

const ProfileSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 12px;
`

const ContentSection = styled.div`
  flex: 5;
  padding: 20px;
  margin-left: 30px;
  margin-right: 30px;
`

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-top: 30px;
  margin-bottom: 30px;
`

const ProfileInfo = styled.div`
  text-align: center;
  margin-top: 20px;
`

const Stats = styled.div`
  margin-top: 10px;
  margin-bottom: 20px;
`

const StatItem = styled.div`
  margin-bottom: 5px;
  cursor: pointer;
`

const Description = styled.p`
  margin-top: 10px;
  margin-bottom: 1rem;
`

const SectionTitle = styled.h2`
  font-size: 17x;
  margin-bottom: 20px;
`

const NicknameTitle = styled.h3`
  font-size: 16px;
`

const SearchInput = styled.input`
  width: 94%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
`

const ButtonGroup = styled.div`
  /* 팔로우/언팔로우 버튼 & 메시지 버튼 간격 조절용으로 넣었습니다 */
  display: flex;
  gap: 10px; /* 간격을 추가 */
`
const TabContainer = styled.div`
  width: 94%;
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ccc;
`

const Tab = styled.div<{ active: boolean }>`
  padding: 10px 30px;
  cursor: pointer;
  border-bottom: ${(props) => (props.active ? '1px solid #000' : 'none')};
  font-weight: ${(props) => (props.active ? 'bold' : 'normal')};
`

interface Post {
  id: number
  mediaUrls: string[]
  createdAt: string
  category: string
  likeCount: number
  commentCount: number // 댓글 수 추가
}

interface UserProfile {
  nickname: string
  profileImageUrl: string
  description: string
  followers: number
  followings: number
  postCount: number
  posts: Post[]
  followersList: {
    isFollowing: boolean
    name: string
    nickname: string
    profileImageUrl: string
    active: string
  }[]
  followingsList: {
    isFollowing: boolean
    name: string
    nickname: string
    profileImageUrl: string
    active: string
  }[]
  allUsers: {
    isFollowing: boolean
    name: string
    nickname: string
    profileImageUrl: string
    active: string
  }[]
}

const UserPage: React.FC = () => {
  const { nickname } = useParams<{ nickname: string }>()
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('posts')
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]) // 북마크
  const [searchQuery, setSearchQuery] = useState('')
  const location = import.meta.env.VITE_APP_API
  const locations = useLocation()
  const [isFollowing, setIsFollowing] = useState(false)
  const { connectAndSubscribe } = useChatWebSocket()
  const { setChatRooms, setChatRoomsInfo } = useChat()
  // const stompClient = getStompClient()
  // const payload = [nickname]

  const fetchUserData = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await axios.get(
        `${location}/user?nickname=${nickname}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const userData = response.data

      const followingResponse = await axios.get(
        `${location}/follow/following?nickname=${nickname}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const followerResponse = await axios.get(
        `${location}/follow/follower?nickname=${nickname}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const allUsersResponse = await axios.get(`${location}/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const allUsers = allUsersResponse.data.map((user: any) => ({
        isFollowing: followingResponse.data.some(
          (followingUser: any) => followingUser.nickname === user.nickname
        ),
        ...user,
      }))

      // 각 게시글의 댓글 수를 가져와서 posts 배열에 추가
      const postsWithCommentCounts = await Promise.all(
        userData.posts.map(async (post: any) => {
          const comments = await getCommentsByPostId(post.id)
          return {
            id: post.id,
            mediaUrls: post.mediaUrls,
            createdAt: post.createdAt,
            category: post.category,
            likeCount: post.likeCount,
            commentCount: comments.length, // 댓글 수 추가
          }
        })
      )

      setUserInfo({
        nickname: userData.nickname,
        profileImageUrl: userData.profileImageUrl || defaultProfileImage,
        description: userData.description,
        followers: parseInt(userData.follower, 10),
        followings: parseInt(userData.following, 10),
        postCount: userData.posts ? userData.posts.length : 0,
        posts: postsWithCommentCounts,
        followersList: followerResponse.data
          ? followerResponse.data.map((user: any) => ({
              isFollowing: true,
              name: user.name,
              nickname: user.nickname,
              profileImageUrl: user.profileImageUrl || defaultProfileImage,
              active: user.active,
            }))
          : [],
        followingsList: followingResponse.data
          ? followingResponse.data.map((user: any) => ({
              isFollowing: true,
              name: user.name,
              nickname: user.nickname,
              profileImageUrl: user.profileImageUrl || defaultProfileImage,
              active: user.active,
            }))
          : [],
        allUsers,
      })

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      setLoading(false)
    }
  }

  const handleFollow = async (nickname: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const location = import.meta.env.VITE_APP_API
      const response = await fetch(`${location}/follow/add`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname }),
      })

      if (response.ok) {
        setUserInfo((prevUserInfo) => {
          if (!prevUserInfo) return prevUserInfo
          return {
            ...prevUserInfo,
            followingsList: prevUserInfo.followingsList.map((user) =>
              user.nickname === nickname ? { ...user, isFollowing: true } : user
            ),
            followersList: prevUserInfo.followersList.map((user) =>
              user.nickname === nickname ? { ...user, isFollowing: true } : user
            ),
            allUsers: prevUserInfo.allUsers.map((user) =>
              user.nickname === nickname ? { ...user, isFollowing: true } : user
            ),
          }
        })
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleUnfollow = async (nickname: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const location = import.meta.env.VITE_APP_API
      const response = await fetch(`${location}/follow/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname }),
      })

      if (response.ok) {
        setUserInfo((prevUserInfo) => {
          if (!prevUserInfo) return prevUserInfo
          return {
            ...prevUserInfo,
            followingsList: prevUserInfo.followingsList.map((user) =>
              user.nickname === nickname
                ? { ...user, isFollowing: false }
                : user
            ),
            followersList: prevUserInfo.followersList.map((user) =>
              user.nickname === nickname
                ? { ...user, isFollowing: false }
                : user
            ),
            allUsers: prevUserInfo.allUsers.map((user) =>
              user.nickname === nickname
                ? { ...user, isFollowing: false }
                : user
            ),
          }
        })
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const checkIfFollowing = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await axios.get(`${location}/follow/following`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const followingData = response.data
      setIsFollowing(
        followingData.some((user: any) => user.nickname === nickname)
      )
    } catch (error) {
      console.error('Failed to check if following:', error)
    }
  }

  useEffect(() => {
    fetchUserData()
    setSelectedTab('posts')
  }, [nickname])

  useEffect(() => {
    const params = new URLSearchParams(locations.search)
    const tab = params.get('tab')
    setSelectedTab(tab || 'posts')
  }, [locations.search])

  useEffect(() => {
    if (nickname) {
      checkIfFollowing()
    }
  }, [nickname])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredFollowings = userInfo?.followingsList.filter((user) =>
    user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredFollowers = userInfo?.followersList.filter((user) =>
    user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFollowUser = async () => {
    if (nickname) {
      await handleFollow(nickname)
      setIsFollowing(true)
    } else {
      console.error('Nickname is undefined')
    }
  }

  const handleUnfollowUser = async () => {
    if (nickname) {
      await handleUnfollow(nickname)
      setIsFollowing(false)
    } else {
      console.error('Nickname is undefined')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!userInfo) {
    return <div>Failed to load user data</div>
  }

  const dm = async () => {
    const token = localStorage.getItem('token')
    const payload = { nicknames: [nickname] }

    if (!token) {
      console.error('Token is missing')
      return
    }

    // 사이드바의 activePage를 'chat' 설정하는 로직 필요 (여기서는 생략)

    // 웹소켓 연결
    if (getStompClient() == null) {
      connectAndSubscribe()
    }

    // 기존 채팅방 목록 가져오기
    const data = await fetchChatRooms(token)
    const chatRooms = data.chatRooms
    const chatRoomsInfo = data.chatRoomsInfo

    setChatRooms(chatRooms)
    setChatRoomsInfo(chatRoomsInfo)

    const stompClient = getStompClient()

    setTimeout(() => {
      if (stompClient != null) {
        stompClient.publish({
          destination: '/app/chatRoom/create',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        })
      }
    }, 50)
  }

  const fetchBookmarkedPosts = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await axios.get(`${location}/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setBookmarkedPosts(response.data)
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
    }

    useEffect(() => {
      fetchUserData()
      if (selectedTab === 'bookmarks') {
        fetchBookmarkedPosts()
      }
    }, [selectedTab])
  }

  return (
    <Container>
      <ProfileSection>
        <ProfileImage src={userInfo.profileImageUrl} alt="Profile" />
        <ProfileInfo>
          <NicknameTitle>{userInfo.nickname}</NicknameTitle>
          <Stats>
            <StatItem onClick={() => setSelectedTab('posts')}>
              게시글 {userInfo.postCount}
            </StatItem>
            <StatItem onClick={() => setSelectedTab('followings')}>
              팔로잉 {userInfo.followings}
            </StatItem>
            <StatItem onClick={() => setSelectedTab('followers')}>
              팔로워 {userInfo.followers}
            </StatItem>
          </Stats>
          <Description>{userInfo.description}</Description>
          <ButtonGroup>
            {isFollowing ? (
              <Button onClick={handleUnfollowUser} className="btn-secondary">
                언팔로우
              </Button>
            ) : (
              <Button onClick={handleFollowUser} className="btn-primary">
                팔로우
              </Button>
            )}
            <Button onClick={dm} className="btn-primary">
              메시지
            </Button>
          </ButtonGroup>
        </ProfileInfo>
      </ProfileSection>
      <ContentSection>
        <TabContainer>
          <Tab
            active={selectedTab === 'posts'}
            onClick={() => setSelectedTab('posts')}
          >
            게시글
          </Tab>
          {/* <Tab active={selectedTab === 'bookmarks'} onClick={() => setSelectedTab('bookmarks')}>
            북마크
          </Tab> */}
        </TabContainer>
        {selectedTab === 'posts' && (
          <>
            {/* <SectionTitle>게시글</SectionTitle> */}
            <Posts posts={userInfo.posts} />
          </>
        )}
        {selectedTab === 'bookmarks' && (
          <>
            {/* <SectionTitle>북마크</SectionTitle> */}
            {bookmarkedPosts.length > 0 ? (
              <Posts posts={bookmarkedPosts} />
            ) : (
              <div>북마크한 게시글이 없습니다</div>
            )}
          </>
        )}
        {selectedTab === 'followings' && (
          <>
            <SectionTitle>팔로잉</SectionTitle>
            <SearchInput
              type="text"
              placeholder="검색"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <UserFollowList
              users={filteredFollowings || userInfo.followingsList}
              searchQuery={searchQuery}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
            />
          </>
        )}
        {selectedTab === 'followers' && (
          <>
            <SectionTitle>팔로워</SectionTitle>
            <SearchInput
              type="text"
              placeholder="검색"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <UserFollowList
              users={filteredFollowers || userInfo.followersList}
              searchQuery={searchQuery}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
            />
          </>
        )}
      </ContentSection>
    </Container>
  )
}

export default UserPage
