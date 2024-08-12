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
} from '../icons/icons'
import ThemeController from '../ThemeController/ThemeController'
import Search from '../Search/search'
import NotificationPage from '../../pages/notificationPage'
import CreateChatRoomButton from '../Chat/createChatRoomButton'
import { fetchChatRooms } from '../../api/chatApi'
import { useChatWebSocket, getStompClient, setActiveChatRoomPage } from '@/websocket/chatWebSocket'
import { useChat } from '../../context/chatContext'
import ChatListPage from '@/pages/Chat/chatListPage'
import Modal from '../Modal/modal'
import AllUserList from '../FollowList/AllUserList'
import fetchAllUsers from '@/data/fetchAllUsers'
import { handleLogout } from '../Logout/Logout'
import { WebSocketProvider } from '../WebSocketProvider/WebSocketProvider'
import FollowContentsPage from '@/pages/FollowContentsPage'
import MainSidebarPage from '@/pages/MainSidebarPage'
import MakeContent from '@/pages/MakeContent/makeContent'
import { useWebSocket } from '../WebSocketProvider/WebSocketProvider'
import Button from '../Button/button'

interface SidebarProps {
  theme: 'light' | 'dark'
}

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
`

const LeftSidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 13rem;
  height: 100%;
  z-index: 10;
  position: fixed;
  margin-left: 20px;

  background-color: #f8faff;
`

const RightSidebar = styled.div<{ isVisible: boolean }>`
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 20rem;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.3);
  z-index: 5;
  position: relative;
  margin-left: 15rem;
  background-color: #f8faff;
`

const TopRightSidebar = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  padding-right: 10px;
`

const MainWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  width: calc(100% - 5rem);
  margin-left: 5rem;
  padding: 20px;
  background-color: #eef2ff; /* 전체 영역 배경색 */
`

const ContentContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  background-color: #ffffff; /* 콘텐츠 영역 배경색 */
  border-radius: 15px; /* 모서리를 둥글게 */
  margin-left: 20px; /* RightSidebar와의 간격 */
`

// const ContentPage = styled.div`
//   width: 100%;
//   height: 100%;
// `


// const Line = styled.div`
//   width: 1.4px;
//   height: 97.5%;
//   margin-top: 13px;
//   background: #c9c9c9;
//   position: absolute;
//   left: 5rem;
//   z-index: 10000;
// `

const Blank = styled.div`
  height: 45.5vh;
  width: 2.5rem;
`

const LogoIconButtonWrapper = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 13px;
  margin-bottom: 30px;

  &:focus {
    outline: none;
  }
`

const IconButtonWrapper = styled.button.attrs<{ active: boolean }>((props) => ({
  active: props.active,
})) <{ active: boolean }>`
  background: ${({ active }) =>
    active ? 'linear-gradient(to top right, #ae74bc, #01317b)' : 'none'};
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  width: 100%; // 버튼의 너비를 전체 Sidebar 너비로 설정
  height: 70px;
  border-radius: 20%;
  flex-direction: row;  // 아이콘 이름이 오른쪽에 배치됨
  justify-content: flex-start;  // 아이콘과 텍스트를 왼쪽 정렬
  align-items: center;  // 아이콘과 텍스트를 수직 가운데 정렬
  padding-left: 1rem;
  position: relative;

  &:focus {
    outline: none;
    background-color: #f8faff;
  }

  svg {
    fill: ${({ active }) => (active ? '#FFD88B' : '#151515')};
    margin-right: 1.5rem; // 아이콘과 텍스트 사이에 간격 추가
  }
`

const IconSpan = styled.span<{ active: boolean }>`
  font-size: 15px;
  font-weight: bold;
  margin-top: 1.5rem; // 텍스트를 아이콘 기준으로 조금 내리기 위해 추가
  color: ${({ active }) => (active ? '#FFD88B' : '#151515')};
`

// const IconButtonWrapper = styled.button.attrs<{ active: boolean }>((props) => ({
//   active: props.active,
// })) <{ active: boolean }>`
//   background: ${({ active }) =>
//     active ? 'linear-gradient(to top right, #ae74bc, #01317b)' : 'none'};
//   border: none;
//   cursor: pointer;
//   padding: 0;
//   display: flex;
//   width: 4.5rem;
//   height: 70px;
//   border-radius: 20%;
//   flex-direction: column;
//   justify-content: center;
//   align-items: center;
//   position: relative;

//   &:focus {
//     outline: none;
//     background-color: #f8faff;
//   }

//   svg {
//     fill: ${({ active }) => (active ? '#FFD88B' : '#151515')};
//   }
// `

// const IconSpan = styled.span<{ active: boolean }>`
//   margin-top: 2px;
//   margin-bottom: 23px;
//   font-size: 12px;
//   font-weight: bold;
//   color: ${({ active }) => (active ? '#FFD88B' : '#151515')};
// `

const LogOutIconButtonWrapper = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
  position: relative;
  width: 4.2rem;
  height: 55px;
`

const CreateChatRoomButtonWrapeer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  margin-top: 0.5px;
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
  width: 99.5%;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
`

const LogoutDropdown = styled.div`
  position: absolute;
  top: 15px;
  left: 40px;
  width: 200px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 8px;
  z-index: 10;
  transition: transform 0.5s ease;

  h3 {
    margin: 0 0 10px 0;
  }

  button {
    margin: auto 15px;
    &:hover {
      transform: scale(1.2);
    }
  }
`

const Badge = styled.span`
  position: absolute;
  top: 7px;
  right: 15px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`

const DeleteNotificationsButton = styled.span`
  position: absolute;
  top: 50px;
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
  const [isLogoutDropdownOpen, setLogoutDropdownOpen] = useState(false)
  const [isUploadModalOpen, setUploadModalOpen] = useState(false)
  const navigate = useNavigate()
  const { connectAndSubscribe, disconnect } = useChatWebSocket()
  const { setChatRooms, setChatRoomsInfo } = useChat()

  const [token] = useState<string>(localStorage.getItem('token') || '')
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const { notifyCount, deleteNotificationAll, notifications } = useWebSocket()
  const nickname = localStorage.getItem('nickname')
  const location = import.meta.env.VITE_APP_API

  const handleNavigate = (page: string) => {
    if (activePage === page) {
      setActivePage('')  // 이미 활성화된 페이지를 다시 클릭하면 페이지를 닫음
    } else {
      setActivePage(page)
      if (page === 'chat') {
        if (getStompClient() == null) {
          connectAndSubscribe()
        }
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
    const getAllUsers = async () => {
      const users = await fetchAllUsers()
      setAllUsers(users)
    }
    getAllUsers()
  }, [])

  // activePage가 'chat'이 아닌 경우 disconnect 호출
  useEffect(() => {
    if (activePage !== 'chat') {
      disconnect()
      setActiveChatRoomPage(-1)
    }
  }, [activePage])

  // 현재 활성된 페이지에 따라 콘텐츠 렌더링
  const renderContentPage = () => {
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
        return null; // 기본적으로 아무것도 렌더링하지 않음
    }
  }

  // 검색창 보여주기 여부
  const shouldShowSearch = () => {
    return (
      activePage === 'myPage'
    )
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleDelete = () => {
    // notifications에 데이터 제거
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

  return (
    <Wrapper>
      <LeftSidebar>
        <LogoIconButtonWrapper
          onClick={() => {
            handleNavigate('main')
            setActivePage('main')
          }}
        >
          <LogoIcon theme={theme} />
        </LogoIconButtonWrapper>
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
            setUploadModalOpen(true)
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
        </IconButtonWrapper>
        <IconButtonWrapper
          id="chat-icon"
          active={activePage === 'chat'}
          onClick={() => handleNavigate('chat')}
        >
          <ChatIcon theme={theme} />
          <IconSpan active={activePage === 'chat'}>메시지</IconSpan>
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
          <IconSpan active={activePage === 'followContents'}>팔로우 컨텐츠</IconSpan>
        </IconButtonWrapper>
        <IconButtonWrapper
          id="mypage-icon"
          active={activePage === 'myPage'}
          onClick={() => handleNavigate('myPage')}
        >
          <MyPageIcon theme={theme} />
          <IconSpan active={activePage === 'myPage'}>마이 페이지</IconSpan>
        </IconButtonWrapper>
        {/* <LogOutIconButtonWrapper
          onClick={() => {
            setLogoutDropdownOpen(!isLogoutDropdownOpen)
          }}
        >
          <ExitIcon theme={theme} />
          {isLogoutDropdownOpen && (
            <Modal
              isOpen={isLogoutDropdownOpen}
              showCloseButton={false}
              onClose={() => setLogoutDropdownOpen(false)}
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
                  <Button onClick={() => handleLogout(setLogoutDropdownOpen)}>
                    네
                  </Button>
                  <Button onClick={() => setLogoutDropdownOpen(false)}>
                    아니오
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </LogOutIconButtonWrapper> */}
        <Blank />
        <ThemeController />
      </LeftSidebar>

      {/* <Line /> */}

      <RightSidebar isVisible={activePage !== ''}>
        <TopRightSidebar>
          <NowaIcon theme={theme} />
          {activePage === 'chat' && (
            <CreateChatRoomButtonWrapeer>
              <CreateChatRoomButton />
            </CreateChatRoomButtonWrapeer>
          )}
        </TopRightSidebar>
        <ContentDiv>
          {shouldShowSearch() && (
            <SearchContainer>
              <Search />
            </SearchContainer>
          )}
          <ContentPage>{renderContentPage()}</ContentPage>
        </ContentDiv>
      </RightSidebar>
      {isUploadModalOpen && (
        <Modal
          isOpen={isUploadModalOpen}
          showCloseButton={false}
          onClose={() => setUploadModalOpen(false)}
        >
          <div>
            <MakeContent onClose={() => setUploadModalOpen(false)} />
          </div>
        </Modal>
      )}
    </Wrapper>
  )
}

export default Sidebar
