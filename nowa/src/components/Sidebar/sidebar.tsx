import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import {
  ChatIcon,
  ContentsIcon,
  FollowContentsIcon,
  LogoIcon,
  MainIcon,
  MyPageIcon,
  NewCreateIcon,
  NotificationsIcon,
  NowaIcon,
  ExitIcon,
  SearchIcon,
} from '../icons/icons'
import Search from '../Search/search'
import NotificationPage from '../../pages/notificationPage'
import CreateChatRoomButton from '../Chat/createChatRoomButton'
import { fetchChatRooms } from '../../api/chatApi'
import {
  useChatWebSocket,
  getStompClient,
  setActiveChatRoomPage,
} from '@/websocket/chatWebSocket'
import { useChat } from '../../context/chatContext'
import ChatListPage from '@/pages/Chat/chatListPage'
import Modal from '../Modal/modal'
import AllUserList from '../FollowList/AllUserList'
import fetchAllUsers from '@/data/fetchAllUsers'
import { handleLogout } from '../Logout/Logout'
import FollowContentsPage from '@/pages/FollowContentsPage'
import MainSidebarPage from '@/pages/MainSidebarPage'
import MakeContent from '@/pages/MakeContent/makeContent'
import { useWebSocket } from '../WebSocketProvider/WebSocketProvider'
import Button from '../Button/button'
import SideFollowList from '../FollowList/SidebarFollowList'
import axios from 'axios'
import defaultProfileImage from '../../../../defaultprofile.png'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

interface SidebarProps {
  theme: 'light' | 'dark'
}

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  width: -30px;
  justify-content: space-between;
`

const LeftSidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 16rem;
  height: 100%;
  z-index: 201;
  position: fixed;
  background-color: #f8faff;
`

const Line = styled.div`
  width: 1px;
  height: 100vh;
  background-color: rgba(160, 160, 160, 0.5);
  opacity: 0.8;
  position: absolute; /* absolute로 설정하여 정확한 위치 지정 */
  left: 15.2rem; /* LeftSidebar의 너비와 동일하게 설정 */
  top: 0;
  z-index: 202;
`

const RightSidebar = styled.div<{ isVisible: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 20.5rem; // RightSidebar 너비 설정
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.05);
  z-index: 200;
  position: fixed;
  top: 0;
  left: ${({ isVisible }) => (isVisible ? '15rem' : '-15rem')};
  height: 100%;
  background-color: #f8faff;
  transition: left 0.3s ease-in-out;
  border-right: 1px solid rgba(160, 160, 160, 0.5);
`
const TopRightSidebar = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  padding-right: 10px;
`

const RightSection = styled.div`
  width: 18rem;
  height: 100%;
  position: fixed;
  right: 0;
  background-color: #f8faff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding-top: 2rem;
  padding-left: 2rem;
  padding-right: 2rem;
  box-sizing: border-box;
  z-index: 10;
  border-left: 1px solid rgba(160, 160, 160, 0.5);
`

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 15px;
  margin-left: 0.3rem;
`

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 15px;
  &:hover {
    cursor: pointer;
  }
`

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 10px;
`

const Nickname = styled.span`
  font-weight: bold;
  font-size: 14px;
`

const LoginId = styled.span`
  color: #888;
  font-size: 14px;
`

const Name = styled.span`
  color: #888;
  font-size: 14px;
`

const LogOutIconButtonWrapper = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding-bottom: 1.5rem;
  display: flex;
  align-items: center;
  margin-left: auto; /* 오른쪽 정렬 */
  margin-right: 10px; /* 오른쪽 정렬 */
  svg {
    width: 18px;
    height: 18px;
  }
`

const FollowListContainer = styled.div`
  width: 100%;
  margin-top: 10px;
  max-height: 300px; /* 스크롤 영역의 최대 높이 설정 */
  overflow-y: auto; /* 수직 스크롤 추가 */
`

const RecommendationsContainer = styled.div`
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
  max-height: 180px; /* 스크롤 영역의 최대 높이 설정 */
  overflow-y: auto; /* 수직 스크롤 추가 */
`

const RecommendationTitle = styled.h3`
  font-size: 15px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 8px;
`

const RecommendationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
`

const RecommendationItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3px;
  width: 100%;
`

// const ShowMoreText = styled.div<{ visible: boolean }>`
//   display: ${({ visible }) => (visible ? 'block' : 'none')};
//   text-align: center;
//   font-size: 14px;
//   color: #888;
//   margin-top: 10px;
// `

const FollowButton = styled.button`
  margin-left: auto;
  margin-bottom: 1rem;
  padding: 0.2rem 0.7rem;
  background-color: black;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  height: 35px;
  width: 80px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.6);
  }

  &:focus {
    outline: none;
  }
`

const Blank = styled.div`
  height: 45.5vh;
  width: 2.5rem;
`

const LogoIconButtonWrapper = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center; /* 세로 중앙 정렬 */
  justify-content: center;
  padding: 0;
  margin-bottom: 25px;
  margin-left: 11rem;
  &:focus {
    outline: none;
  }
`
const LogoContainer = styled.div`
  display: flex;
  align-items: center; /* 세로 중앙 정렬 */
  justify-content: center;
  margin-bottom: 1rem;
  margin-top: 0.5rem;
`

const IconButtonWrapper = styled.button.attrs<{ active: boolean }>((props) => ({
  active: props.active,
}))<{ active: boolean }>`
  background: ${({ active }) => (active ? 'black' : 'none')};
  border: none;
  cursor: pointer;
  padding-left: 0.7rem;
  display: flex;
  align-items: center;
  width: 80%;
  height: 70px;
  left: 0;
  border-radius: 20px;
  margin-bottom: 0.5rem;
  justify-content: flex-start;
  position: relative;

  &:focus {
    outline: none;
    background-color: black;
    color: white;

    svg {
      fill: white;
    }

    span {
      color: white;
    }
  }

  &:hover {
    background-color: black;

    svg {
      fill: white;
    }

    span {
      color: white;
    }
  }

  svg {
    fill: ${({ active }) => (active ? 'white' : '#151515')};
    margin-right: 1rem;
    margin-top: -1.25rem;
  }
`

const IconSpan = styled.span<{ active: boolean }>`
  font-size: 14px;
  font-weight: bold;
  color: ${({ active }) => (active ? 'white' : '#151515')};
`

const CreateChatRoomButtonWrapeer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  margin-top: 1.3rem;
  margin-bottom: 2rem;
`

const ContentDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  position: relative;
`

const ContentPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`

const SearchContainer = styled.div`
  margin-left: 6px;
  margin-top: 5.5rem;
  width: 99.5%;
`

const SearchInput = styled.input`
  width: 90%;
  padding: 9px;
  margin-bottom: 20px;
  margin-left: 10px;
  border: 0.1px solid #ccc;
  border-radius: 8px;
  font-size: 15px;
`

const Badge = styled.span`
  width: 1.4rem;
  height: 1.4rem;
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  margin-left: auto;
  margin-right: 1rem;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`

const DeleteNotificationsButton = styled.span`
  z-index: 50;
  position: absolute;
  top: 70px;
  right: 15px;
  background-color: #9269b2;
  color: #fdfdfd;
  border-radius: 5px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover {
    transform: scale(1.03);
  }
`

const Sidebar: React.FC<SidebarProps> = ({ theme }) => {
  const [activePage, setActivePage] = useState<string>('')
  const [isUploadModalOpen, setUploadModalOpen] = useState(false)
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<null | {
    profileImageUrl: string
    nickname: string
    loginId: string
  }>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])

  const navigate = useNavigate()
  const { connectAndSubscribe, disconnect } = useChatWebSocket()
  const { setChatRooms, setChatRoomsInfo } = useChat()

  const [token, setToken] = useState<string>(
    localStorage.getItem('token') || ''
  )
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const {
    notifyCount,
    deleteNotificationAll,
    notifications,
    loginActive,
    setFollowList,
  } = useWebSocket()
  const [, setIsScrolled] = useState(false)
  const [followingList, setFollowingList] = useState<any[]>([]) // 팔로잉 리스트 상태 추가

  const nickname = localStorage.getItem('nickname')
  const location = import.meta.env.VITE_APP_API

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = event.currentTarget
    setIsScrolled(scrollTop > 0)
  }

  const handleNavigate = (page: string) => {
    if (activePage === page) {
      setActivePage('')
    } else {
      setActivePage(page)
      if (page === 'main') {
        navigate('/main') // 메인 아이콘 클릭 시 /main으로 이동
      } else if (page === 'myPage') {
        navigate('/myPage')
      } else if (page === 'chat') {
        if (getStompClient() == null) {
          connectAndSubscribe()
        }
        const token = localStorage.getItem('token') || ''
        fetchChatRooms(token).then((data) => {
          const chatRooms = data.chatRooms
          const chatRoomsInfo = data.chatRoomsInfo
          setChatRooms(chatRooms)
          setChatRoomsInfo(chatRoomsInfo)
        })
      }
    }
  }

  // 전체 유저 목록 가져오기
  useEffect(() => {
    console.log('notifyCount :', notifyCount)
    const getAllUsers = async () => {
      const users = await fetchAllUsers()
      setAllUsers(users)
    }
    getAllUsers()
  }, [])

  // activePage가 'chat'이 아닌 경우 disconnect 호출
  useEffect(() => {
    if (activePage === 'main' || activePage === 'myPage') {
      disconnect()
      setActiveChatRoomPage(-1)
    }
  }, [activePage])

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  useEffect(() => {
    setFollowingList(loginActive)
    console.log(followingList)
  }, [loginActive])

  const handleDelete = () => {
    deleteNotificationAll()

    // 알림 삭제를 위한 API 호출
    const deleteNotifications = async () => {
      try {
        const token = localStorage.getItem('token') // 토큰 가져오기
        if (!token) {
          throw new Error('No token found')
        }

        const response = await fetch(`${location}/notify/all`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }, // 삭제할 알림의 ID를 body에 포함
          body: JSON.stringify({ nickname: nickname }),
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
      } catch (error) {
        console.error('Failed to delete notification:', error)
      }
    }

    deleteNotifications()
  }

  // 검색창 보여주기 여부
  const shouldShowSearch = () => {
    return (
      activePage !== 'notifications' &&
      activePage !== 'followContents' &&
      activePage !== 'chat' &&
      activePage !== 'myPage' &&
      activePage !== 'main' &&
      activePage !== 'contents' &&
      activePage !== ''
    )
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // 오른쪽 섹션
  useEffect(() => {
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

        setUserInfo({
          profileImageUrl: response.data.profileImageUrl || defaultProfileImage,
          nickname: response.data.nickname,
          loginId: response.data.loginId, // loginId를 표시
        })

        // 추천 친구 목록 가져오기
        const allUsersResponse = await axios.get(`${location}/user/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const followingResponse = await axios.get(
          `${location}/follow/following`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        setFollowingList(followingResponse.data)
        setFollowList(followingResponse.data)

        const followingNicknames = followingResponse.data.map(
          (user: any) => user.nickname
        )

        const notFollowingUsers = allUsersResponse.data.filter(
          (user: any) =>
            !followingNicknames.includes(user.nickname) &&
            user.nickname !== response.data.nickname
        )

        setRecommendations(notFollowingUsers) //
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      }
    }

    fetchUserData()
  }, [navigate])

  const handleFollow = async (nickname: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      await axios.put(
        `${location}/follow/add`,
        { nickname },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      // 팔로우 후 추천 목록에서 해당 유저 제거
      setRecommendations((prevRecommendations) =>
        prevRecommendations.filter((user) => user.nickname !== nickname)
      )
    } catch (error) {
      console.error('Error following user:', error)
    }
  }

  const handleClickNavigate = (nickname: string) => {
    if (nickname) {
      navigate(`/user/${nickname}`)
    } else {
      alert('조회할 수 없는 유저입니다.')
    }
  }

  // 현재 활성된 페이지에 따라 콘텐츠 렌더링
  const renderContentPage = () => {
    if (activePage === '') return null

    switch (activePage) {
      case 'main':
        return <MainSidebarPage />
      case 'notifications':
        return <NotificationPage />
      case 'chat':
        return <ChatListPage />
      case 'contents':
        return <MainSidebarPage />
      case 'followContents':
        return <FollowContentsPage />
      case 'myPage':
        return <div></div>
      default:
        return <MainSidebarPage />
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isUploadModalOpen) {
        setUploadModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isUploadModalOpen])

  return (
    <Wrapper>
      <LeftSidebar>
        <LogoContainer>
          <LogoIconButtonWrapper onClick={() => handleNavigate('main')}>
            <LogoIcon theme={theme} />
          </LogoIconButtonWrapper>
          <NowaIcon theme={theme} />
        </LogoContainer>
        <IconButtonWrapper
          id="main-icon"
          active={activePage === 'main'}
          onClick={() => handleNavigate('main')}
        >
          <MainIcon theme={theme} />
          <IconSpan active={activePage === 'main'}>메인</IconSpan>
        </IconButtonWrapper>
        <IconButtonWrapper
          id="new-post-icon"
          active={isUploadModalOpen}
          onClick={() => {
            setUploadModalOpen(true) // 모달 열기
          }}
        >
          <NewCreateIcon theme={theme} />
          <IconSpan active={isUploadModalOpen}>새 게시물</IconSpan>
        </IconButtonWrapper>
        <IconButtonWrapper
          id="notifications-icon"
          active={activePage === 'notifications'}
          onClick={() => handleNavigate('notifications')}
        >
          <NotificationsIcon theme={theme} />
          <IconSpan active={activePage === 'notifications'}>알림</IconSpan>
          {notifyCount >= 1 && <Badge>{notifyCount}</Badge>}
        </IconButtonWrapper>
        <IconButtonWrapper
          id="chat-icon"
          active={activePage === 'chat'}
          onClick={() => {
            if (getStompClient() == null) {
              connectAndSubscribe()
            }
            handleNavigate('chat')
            fetchChatRooms(token).then((data) => {
              const chatRooms = data.chatRooms
              const chatRoomsInfo = data.chatRoomsInfo

              setChatRooms(chatRooms)
              setChatRoomsInfo(chatRoomsInfo)
            })
          }}
        >
          <ChatIcon theme={theme} />
          <IconSpan active={activePage === 'chat'}>메시지</IconSpan>
        </IconButtonWrapper>

        <IconButtonWrapper
          id="search-icon"
          active={activePage === 'search'}
          onClick={() => handleNavigate('search')}
        >
          <SearchIcon theme={theme} />
          <IconSpan active={activePage === 'search'}>검색</IconSpan>
        </IconButtonWrapper>

        <IconButtonWrapper
          id="contents-icon"
          active={activePage === 'contents'}
          onClick={() => handleNavigate('contents')}
        >
          <ContentsIcon theme={theme} />
          <IconSpan active={activePage === 'contents'}>주변 컨텐츠</IconSpan>
        </IconButtonWrapper>
        <IconButtonWrapper
          id="follow-contents-icon"
          active={activePage === 'followContents'}
          onClick={() => handleNavigate('followContents')}
        >
          <FollowContentsIcon theme={theme} />
          <IconSpan active={activePage === 'followContents'}>
            팔로우 컨텐츠
          </IconSpan>
        </IconButtonWrapper>
        <IconButtonWrapper
          id="mypage-icon"
          active={activePage === 'myPage'}
          onClick={() => {
            handleNavigate('myPage')
          }}
        >
          <MyPageIcon theme={theme} />
          <IconSpan active={activePage === 'myPage'}>마이 페이지</IconSpan>
        </IconButtonWrapper>
        <Blank />
      </LeftSidebar>

      <Line />

      <RightSidebar isVisible={activePage !== ''}>
        <TopRightSidebar>
          {activePage === 'chat' && (
            <CreateChatRoomButtonWrapeer>
              <CreateChatRoomButton />
            </CreateChatRoomButtonWrapeer>
          )}
        </TopRightSidebar>
        <TopRightSidebar>
          {activePage === 'notifications' && notifications.length > 0 && (
            <DeleteNotificationsButton onClick={handleDelete}>
              전체 삭제
            </DeleteNotificationsButton>
          )}
        </TopRightSidebar>
        <ContentDiv>
          {shouldShowSearch() && (
            <SearchContainer>
              <Search />
            </SearchContainer>
          )}
          {activePage === 'myPage' && (
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="전체 유저 검색"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <AllUserList users={allUsers} searchQuery={searchQuery} />
            </SearchContainer>
          )}
          <ContentPage>{renderContentPage()}</ContentPage>
        </ContentDiv>
      </RightSidebar>

      {/* Right Section */}
      <RightSection>
        {userInfo && (
          <ProfileContainer>
            <ProfileImage
              src={userInfo.profileImageUrl}
              alt="Profile"
              onClick={() => navigate('/myPage')}
            />
            <UserInfo>
              <Nickname>{userInfo.nickname}</Nickname>
              <LoginId>{userInfo.loginId}</LoginId>
            </UserInfo>
            <LogOutIconButtonWrapper onClick={() => setLogoutModalOpen(true)}>
              <ExitIcon theme="light" />
            </LogOutIconButtonWrapper>
          </ProfileContainer>
        )}

        <RecommendationTitle>추천 친구</RecommendationTitle>
        <RecommendationsContainer onScroll={handleScroll}>
          <RecommendationList>
            {recommendations.map((user) => (
              <RecommendationItem key={user.nickname}>
                <ProfileContainer>
                  <ProfileImage
                    src={user.profileImageUrl || defaultProfileImage}
                    alt="Profile"
                    onClick={() => handleClickNavigate(user.nickname)}
                  />
                  <UserInfo>
                    <Nickname>{user.nickname}</Nickname>
                    <Name>{user.name}</Name>
                  </UserInfo>
                </ProfileContainer>
                <FollowButton onClick={() => handleFollow(user.nickname)}>
                  팔로우
                </FollowButton>
              </RecommendationItem>
            ))}
          </RecommendationList>
          {/* <ShowMoreText visible={!isScrolled}>더 보기</ShowMoreText> */}
        </RecommendationsContainer>

        {/* FollowList 추가 */}
        <RecommendationTitle>팔로잉 목록</RecommendationTitle>
        <FollowListContainer>
          <SideFollowList users={followingList} searchQuery={searchQuery} />
        </FollowListContainer>
      </RightSection>
      {isUploadModalOpen && (
        <Modal
          isOpen={isUploadModalOpen}
          showCloseButton={false}
          onClose={() => setUploadModalOpen(false)}
          disableOverlayClick={true}
        >
          <div>
            <DndProvider backend={HTML5Backend}>
              <MakeContent onClose={() => setUploadModalOpen(false)} />
            </DndProvider>
          </div>
        </Modal>
      )}
      {isLogoutModalOpen && (
        <Modal
          isOpen={isLogoutModalOpen}
          showCloseButton={false}
          onClose={() => setLogoutModalOpen(false)}
        >
          <div style={{ textAlign: 'center' }}>
            <h3>로그아웃 하시겠습니까?</h3>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                marginTop: '20px',
              }}
            >
              <Button onClick={() => handleLogout(setLogoutModalOpen)}>
                네
              </Button>
              <Button onClick={() => setLogoutModalOpen(false)}>아니오</Button>
            </div>
          </div>
        </Modal>
      )}
    </Wrapper>
  )
}

export default Sidebar
