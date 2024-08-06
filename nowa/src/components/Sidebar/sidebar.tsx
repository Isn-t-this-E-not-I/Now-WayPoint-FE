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
import CreateChatRoomButton from '../CreateChatRoomButton/createChatRoomButton'
import { fetchChatRooms } from '../../api/chatApi'
import { useChatWebSocket, getStompClient } from '@/websocket/chatWebSocket'
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
  width: 5rem;
  height: 100%;
  z-index: 10;
  position: fixed;

  background-color: #f8faff;
`

const RightSidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 20rem;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.3);
  z-index: 5;
  position: relative;
  margin-left: 4.4rem;
  background-color: #f8faff;
`

const Line = styled.div`
  width: 1.4px;
  height: 97.5%;
  margin-top: 13px;
  background: #c9c9c9;
  position: absolute;
  left: 5rem;
  z-index: 10000;
`

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
  margin-bottom: 25px;

  &:focus {
    outline: none;
  }
`

const IconButtonWrapper = styled.button.attrs<{ active: boolean }>((props) => ({
  active: props.active,
}))<{ active: boolean }>`
  background: ${({ active }) =>
    active ? 'linear-gradient(to top right, #ae74bc, #01317b)' : 'none'};
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  width: 4.5rem;
  height: 70px;
  border-radius: 20%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;

  &:focus {
    outline: none;
    background-color: #f8faff;
  }

  svg {
    fill: ${({ active }) => (active ? '#FFD88B' : '#151515')};
  }
`

const IconSpan = styled.span<{ active: boolean }>`
  margin-top: 2px;
  margin-bottom: 23px;
  font-size: 12px;
  font-weight: bold;
  color: ${({ active }) => (active ? '#FFD88B' : '#151515')};
`

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
  margin-top: 14px;
  margin-left: -155px;
`

const CreateChatRoomButtonSpan = styled.span`
  margin-top: -6px;
  margin-left: 5px;
  font-size: 16px;
  font-weight: bold;
  color: #151515;
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

const Sidebar: React.FC<SidebarProps> = ({ theme }) => {
  const [activePage, setActivePage] = useState<string>('')
  const [isLogoutDropdownOpen, setLogoutDropdownOpen] = useState(false)
  const [isUploadModalOpen, setUploadModalOpen] = useState(false)
  const navigate = useNavigate()
  const { connectAndSubscribe, disconnect } = useChatWebSocket()
  const { setChatRooms, setChatRoomsInfo, setActiveChatRoomId } = useChat()

  const [token] = useState<string>(localStorage.getItem('token') || '')
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')

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
      setActiveChatRoomId(null)
    }
  }, [activePage])

  // 현재 활성된 페이지에 따라 콘텐츠 렌더링
  const renderContentPage = () => {
    switch (activePage) {
      case 'main':
        return (
          <div>
            <WebSocketProvider>
              <MainSidebarPage />
            </WebSocketProvider>
          </div>
        )
      case 'notifications':
        return (
          <div>
            <WebSocketProvider>
              <NotificationPage />
            </WebSocketProvider>
          </div>
        )
      case 'chat':
        return <ChatListPage />
      case 'contents':
        return (
          <div>
            <WebSocketProvider>
              <MainSidebarPage />
            </WebSocketProvider>
          </div>
        )
      case 'followContents':
        return (
          <div>
            <WebSocketProvider>
              <FollowContentsPage />
            </WebSocketProvider>
          </div>
        )
      default:
        return (
          <div>
            <WebSocketProvider>
              <MainSidebarPage />
            </WebSocketProvider>
          </div>
        )
    }
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

  const handleNavigate = (page: string) => {
    navigate(`/${page}`)
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
          active={activePage === 'main'}
          onClick={() => {
            handleNavigate('main')
            setActivePage('main')
          }}
        >
          <MainIcon theme={theme} />
          <IconSpan active={activePage === 'main'}>메인</IconSpan>
        </IconButtonWrapper>
        <IconButtonWrapper
          active={isUploadModalOpen}
          onClick={() => {
            setUploadModalOpen(true) // 모달 열기
          }}
        >
          <NewCreateIcon theme={theme} />
          <IconSpan active={isUploadModalOpen}>새 게시물</IconSpan>
        </IconButtonWrapper>
        <IconButtonWrapper
          active={activePage === 'notifications'}
          onClick={() => {
            setActivePage('notifications')
          }}
        >
          <NotificationsIcon theme={theme} />
          <IconSpan active={activePage === 'notifications'}>알림</IconSpan>
        </IconButtonWrapper>
        <IconButtonWrapper
          active={activePage === 'chat'}
          onClick={() => {
            if (getStompClient() == null) {
              connectAndSubscribe()
            }
            setActivePage('chat')
            fetchChatRooms(token).then((data) => {
              // 데이터 구조를 확인하고 필요한 데이터만 추출
              const chatRooms = data.chatRooms
              const chatRoomsInfo = data.chatRoomsInfo

              // state나 context에 데이터를 설정
              setChatRooms(chatRooms)
              setChatRoomsInfo(chatRoomsInfo)
            })
          }}
        >
          <ChatIcon theme={theme} />
          <IconSpan active={activePage === 'chat'}>메시지</IconSpan>
        </IconButtonWrapper>
        <IconButtonWrapper
          active={activePage === 'contents'}
          onClick={() => {
            setActivePage('contents')
          }}
        >
          <ContentsIcon theme={theme} />
          <IconSpan active={activePage === 'contents'}>주변 컨텐츠</IconSpan>
        </IconButtonWrapper>
        <IconButtonWrapper
          active={activePage === 'followContents'}
          onClick={() => {
            setActivePage('followContents')
          }}
        >
          <FollowContentsIcon theme={theme} />
          <IconSpan active={activePage === 'followContents'}>
            팔로우 컨텐츠
          </IconSpan>
        </IconButtonWrapper>
        <IconButtonWrapper
          active={activePage === 'myPage'}
          onClick={() => {
            setActivePage('myPage')
            handleNavigate('mypage')
          }}
        >
          <MyPageIcon theme={theme} />
          <IconSpan active={activePage === 'myPage'}>마이 페이지</IconSpan>
        </IconButtonWrapper>
        <LogOutIconButtonWrapper
          onClick={() => {
            setLogoutDropdownOpen(!isLogoutDropdownOpen)
          }}
        >
          <ExitIcon theme={theme} />
          {isLogoutDropdownOpen && (
            <LogoutDropdown>
              <h3>로그아웃 하시겠습니까?</h3>
              <button onClick={() => handleLogout(setLogoutDropdownOpen)}>
                넵!
              </button>
              <button onClick={() => setLogoutDropdownOpen(false)}>
                아니요..
              </button>
            </LogoutDropdown>
          )}
        </LogOutIconButtonWrapper>
        <Blank />
        <ThemeController />
      </LeftSidebar>

      <Line />

      <RightSidebar>
        <NowaIcon theme={theme} />
        {activePage === 'chat' && (
          <CreateChatRoomButtonWrapeer>
            <CreateChatRoomButton />
            <CreateChatRoomButtonSpan>새 채팅방 생성</CreateChatRoomButtonSpan>
          </CreateChatRoomButtonWrapeer>
        )}
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
      {isUploadModalOpen && (
        <Modal isOpen={isUploadModalOpen} showCloseButton={false}>
          <div>
            <MakeContent onClose={() => setUploadModalOpen(false)} />
          </div>
        </Modal>
      )}
    </Wrapper>
  )
}

export default Sidebar
