import React, { useState, useEffect } from 'react'
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
import ChatListPage from '@/pages/Chat/chatListPage'
import Modal from '../Modal/modal'
import FollowList from '../FollowList/FollowList'
import fetchAllUsers from '@/data/fetchAllUsers'
import { handleLogout } from '../Logout/Logout'
import { useChat } from '@/context/chatContext'
import { useChatWebSocket } from '@/websocket/chatWebSocket'

interface SidebarProps {
  theme: 'light' | 'dark'
  setSelectedPage: (page: string) => void
  onExitChatRoom: (id: number) => void
}

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
`

const LeftSidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 2.6rem;
  height: 100%;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.3);
  z-index: 10;
  position: fixed;
`

const RightSidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 19.5rem;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.3);
  z-index: 5;
  position: relative;
  margin-left: 2.6rem;
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
  margin-bottom: 7.5px;

  &:focus {
    outline: none;
  }
`

const IconButtonWrapper = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 8px;

  &:focus {
    outline: none;
  }
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

const PageTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const PageTitle = styled.div`
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 10px;
  margin-left: 6px;
  align-self: flex-start;
`

const SearchContainer = styled.div`
  margin-left: 6px;
  width: 100%;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
`

const Sidebar: React.FC<SidebarProps> = ({ theme, setSelectedPage }) => {
  const [activePage, setActivePage] = useState<string>('')
  const { setChatRooms, setChatRoomsInfo } = useChat()
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false)

  const [token] = useState<string>(localStorage.getItem('token') || '')
  const [userNickname] = useState<string>(
    localStorage.getItem('nickname') || ''
  )

  const [allUsers, setAllUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const { connectAndSubscribe, disconnect } = useChatWebSocket()

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
    }
  }, [activePage])

  // 현재 활성된 페이지에 따라 콘텐츠 렌더링
  const renderContentPage = () => {
    switch (activePage) {
      case 'notifications':
        return <NotificationPage token={token} userNickname={userNickname} />
      case 'chat':
        return <ChatListPage />
      case 'contents':
        return <div>Contents Page</div>
      case 'followContents':
        return <div>Follow Contents Page</div>
      default:
        return <div>Welcome! This is default!</div>
    }
  }

  // 검색창 보여주기 여부
  const shouldShowSearch = () => {
    return activePage !== 'notifications' && activePage !== 'chat'
  }

  // 현재 페이지 제목
  const getPageTitle = () => {
    switch (activePage) {
      case 'notifications':
        return '알림'
      case 'chat':
        return '메시지'
      case 'contents':
        return '콘텐츠'
      case 'followContents':
        return '팔로우 컨텐츠'
      default:
        return ''
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <Wrapper>
      <LeftSidebar>
        <LogoIconButtonWrapper
          onClick={() => {
            setSelectedPage('main')
          }}
        >
          <LogoIcon theme={theme} />
        </LogoIconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            setSelectedPage('main')
          }}
        >
          <MainIcon theme={theme} />
        </IconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            setSelectedPage('create')
          }}
        >
          <NewCreateIcon theme={theme} />
        </IconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            setActivePage('notifications')
          }}
        >
          <NotificationsIcon theme={theme} />
        </IconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            connectAndSubscribe(userNickname, (error) => console.error(error))
            setActivePage('chat')
            fetchChatRooms(token)
              .then((data) => {
                if (data) {
                  // data가 null이 아니고, undefined도 아닌 경우
                  setChatRooms(data.chatRooms)
                  setChatRoomsInfo(data.chatRoomsInfo)
                } else {
                  console.error('No data received from fetchChatRooms.')
                }
              })
              .catch((error) => {
                console.error('Error fetching chat rooms:', error)
              })
          }}
        >
          <ChatIcon theme={theme} />
        </IconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            setActivePage('contents')
          }}
        >
          <ContentsIcon theme={theme} />
        </IconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            setActivePage('followContents')
          }}
        >
          <FollowContentsIcon theme={theme} />
        </IconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            setSelectedPage('myPage')
          }}
        >
          <MyPageIcon theme={theme} />
        </IconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            setLogoutModalOpen(true)
          }}
        >
          <ExitIcon theme={theme} />
        </IconButtonWrapper>
        <Blank />
        <ThemeController />
      </LeftSidebar>
      <RightSidebar>
        <NowaIcon theme={theme} />
        <ContentDiv>
          <PageTitleWrapper>
            <PageTitle>{getPageTitle()}</PageTitle>
            {activePage === 'chat' && <CreateChatRoomButton />}
          </PageTitleWrapper>
          {shouldShowSearch() && (
            <SearchContainer>
              <Search />
            </SearchContainer>
          )}
          <ContentPage>{renderContentPage()}</ContentPage>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="전체 유저 검색"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <FollowList
              users={allUsers}
              searchQuery={searchQuery}
              onFollow={() => {}}
              onUnfollow={() => {}}
              priorityList={[]}
              allUsers={allUsers}
              showFollowButtons={false}
            />
          </SearchContainer>
        </ContentDiv>
      </RightSidebar>
      {isLogoutModalOpen && (
        <Modal
          isOpen={isLogoutModalOpen}
          onClose={() => setLogoutModalOpen(false)}
        >
          <div>
            <h3>로그아웃 하시겠습니까?</h3>
            <button onClick={() => handleLogout(setLogoutModalOpen)}>네</button>
            <button onClick={() => setLogoutModalOpen(false)}>아니오</button>
          </div>
        </Modal>
      )}
    </Wrapper>
  )
}

export default Sidebar
