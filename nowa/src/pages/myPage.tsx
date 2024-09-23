import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Button from '../components/Button/button'
import styled from 'styled-components'
import defaultProfileImage from '../../../defaultprofile.png'
import Posts from '../components/Posts/Posts'
import FollowList from '../components/FollowList/FollowList'
import { getCommentsByPostId } from '../services/comments'

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
  background-color: white;
`

const ContentSection = styled.div`
  flex: 5;
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
  font-size: 17px;
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
  commentCount: number
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

const MyPage: React.FC = () => {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('posts')
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]) // 북마크
  const [searchQuery, setSearchQuery] = useState('')
  const location = import.meta.env.VITE_APP_API

  const fetchUserData = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/auth')
      return
    }

    try {
      const response = await axios.get(`${location}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },  
      })
      console.log('안녕하세요');

      console.log('Fetching bookmarked posts...')  // 콘솔 로그 추가
      const response2 = await axios.get(`${location}/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log(response2);

      const followingResponse = await axios.get(
        `${location}/follow/following`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const followerResponse = await axios.get(`${location}/follow/follower`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const allUsersResponse = await axios.get(`${location}/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const postsWithCommentCounts = await Promise.all(
        response.data.posts.map(async (post: any) => {
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
        nickname: response.data.nickname,
        profileImageUrl: response.data.profileImageUrl || defaultProfileImage,
        description: response.data.description,
        followers: parseInt(response.data.follower, 10),
        followings: parseInt(response.data.following, 10),
        postCount: response.data.posts ? response.data.posts.length : 0,
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
        allUsers: allUsersResponse.data
          ? allUsersResponse.data.map((user: any) => ({
              isFollowing:
                followingResponse.data.some(
                  (f: any) => f.nickname === user.nickname
                ) ||
                followerResponse.data.some(
                  (f: any) => f.nickname === user.nickname
                ),
              name: user.name,
              nickname: user.nickname,
              profileImageUrl: user.profileImageUrl || defaultProfileImage,
              active: user.active,
            }))
          : [],
      })

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      setLoading(false)
    }
  }

  const fetchBookmarkedPosts = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      console.log('Fetching bookmarked posts...')  // 콘솔 로그 추가
      const response = await axios.get(`${location}/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('Bookmarked posts response:', response)  // 콘솔 로그 추가
      setBookmarkedPosts(response.data)
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
    }
  }

  useEffect(() => {
    fetchUserData()
    fetchBookmarkedPosts()  // 마이페이지 진입 시 북마크 데이터를 호출
  }, [])

  const handleFollow = async (nickname: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const location = import.meta.env.VITE_APP_API
      const response = await fetch(`${location}/follow/add`, {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname }),
      })

      if (response.ok) {
        setUserInfo((prevUserInfo) => {
          if (!prevUserInfo) return prevUserInfo
          return {
            ...prevUserInfo,
            followings: prevUserInfo.followings + 1,
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
      } else {
        console.error('Failed to follow user:', response.statusText)
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
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname }),
      })

      if (response.ok) {
        setUserInfo((prevUserInfo) => {
          if (!prevUserInfo) return prevUserInfo
          return {
            ...prevUserInfo,
            followings: prevUserInfo.followings - 1,
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
      } else {
        console.error('Failed to unfollow user:', response.statusText)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const goToProfileEdit = () => {
    navigate('/mypage/profileEdit')
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredFollowings =
    userInfo?.followingsList.filter((user) =>
      user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

  const filteredFollowers =
    userInfo?.followersList.filter((user) =>
      user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

  if (loading) {
    return <div>Loading...</div>
  }

  if (!userInfo) {
    return <div>Failed to load user data</div>
  }

  return (
    <Container>
      <ProfileSection>
        <ProfileImage src={userInfo.profileImageUrl} alt="Profile" />
        <Button className="btn-primary" onClick={goToProfileEdit}>
          프로필 편집
        </Button>
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
        </ProfileInfo>
      </ProfileSection>
      <ContentSection>
        <TabContainer>
          <Tab active={selectedTab === 'posts'} onClick={() => setSelectedTab('posts')}>
            게시글
          </Tab>
          <Tab active={selectedTab === 'bookmarks'} onClick={() => setSelectedTab('bookmarks')}>
            북마크
          </Tab>
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
            <FollowList
              users={filteredFollowings}
              searchQuery={searchQuery}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              showFollowButtons={true}
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
           <FollowList
              users={filteredFollowers}
              searchQuery={searchQuery}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              showFollowButtons={true}
            />
          </>
        )}
      </ContentSection>
    </Container>
  )
}

export default MyPage