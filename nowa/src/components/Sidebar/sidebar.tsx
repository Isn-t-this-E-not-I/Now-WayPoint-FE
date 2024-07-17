import React, { useState } from 'react'
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
} from '../icons/icons'
import styled from 'styled-components'
import ThemeController from '../ThemeController/ThemeController'
import Search from '../Search/search'
import NotificationPage from '../../pages/notificationPage'
import ChatListPage from '../../pages/chatListPage'
import CreateChatButton from '../CreateChatButton/createChatButton'

interface SidebarProps {
  theme: 'light' | 'dark'
  onChatItemClick: (chatRoom: {
    id: number
    profilePic: string
    name: string
    lastMessage: string
  }) => void
  setSelectedPage: (page: string) => void
}

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
`

const LeftSidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 2.5rem;
  background-color: yellow;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.3);
  z-index: 10;
  position: fixed;
`

const RightSidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 19rem;
  background-color: red;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.3);
  z-index: 5;
  position: relative;
  margin-left: 2.5rem; /* LeftSidebar의 너비만큼 이동 */
`

const Blank = styled.div`
  height: 45.5vh;
  width: 2.5rem;
  background-color: blue;
`

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;

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
  background-color: green;
  position: relative;
`

const ContentPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: purple;
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
  align-self: flex-start;
`

const Sidebar: React.FC<SidebarProps> = ({
  theme,
  onChatItemClick,
  setSelectedPage,
}) => {
  const [activePage, setActivePage] = useState<string>('')

  const [chatRooms, setChatRooms] = useState([
    {
      id: 1,
      profilePic: 'https://via.placeholder.com/40',
      name: 'John Doe',
      lastMessage: 'Hey, how are you?',
    },
    {
      id: 2,
      profilePic: 'https://via.placeholder.com/40',
      name: 'Jane Smith',
      lastMessage: 'Are we still on for tomorrow?',
    },
  ])

  const handleCreateChat = (newChatRoom: {
    id: number
    profilePic: string
    name: string
    lastMessage: string
  }) => {
    setChatRooms([...chatRooms, newChatRoom])
  }

  const handleExitChatRoom = (id: number) => {
    setChatRooms(chatRooms.filter((room) => room.id !== id))
    setSelectedPage('chat')
  }

  const renderContentPage = () => {
    switch (activePage) {
      case 'notifications':
        return <NotificationPage />
      case 'chat':
        return (
          <ChatListPage
            chatRooms={chatRooms}
            onChatItemClick={onChatItemClick}
            onExitChatRoom={handleExitChatRoom}
          />
        )
      case 'contents':
        return <div>Contents Page</div>
      case 'followContents':
        return <div>Follow Contents Page</div>
      default:
        return <div>Welcome! This is default!</div>
    }
  }

  const shouldShowSearch = () => {
    return activePage !== 'notifications' && activePage !== 'chat'
  }

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

  return (
    <Wrapper>
      <LeftSidebar>
        <IconButton onClick={() => setSelectedPage('main')}>
          <LogoIcon theme={theme} />
        </IconButton>
        <IconButton onClick={() => setSelectedPage('main')}>
          <MainIcon theme={theme} />
        </IconButton>
        <IconButton onClick={() => setSelectedPage('create')}>
          <NewCreateIcon theme={theme} />
        </IconButton>
        <IconButton onClick={() => setActivePage('notifications')}>
          <NotificationsIcon theme={theme} />
        </IconButton>
        <IconButton onClick={() => setActivePage('chat')}>
          <ChatIcon theme={theme} />
        </IconButton>
        <IconButton onClick={() => setActivePage('contents')}>
          <ContentsIcon theme={theme} />
        </IconButton>
        <IconButton onClick={() => setActivePage('followContents')}>
          <FollowContentsIcon theme={theme} />
        </IconButton>
        <IconButton onClick={() => setSelectedPage('myPage')}>
          <MyPageIcon theme={theme} />
        </IconButton>
        <Blank />
        <ThemeController />
      </LeftSidebar>
      <RightSidebar>
        <NowaIcon theme={theme} />
        <ContentDiv>
          <PageTitleWrapper>
            <PageTitle>{getPageTitle()}</PageTitle>
            {activePage === 'chat' && (
              <CreateChatButton theme={theme} onCreateChat={handleCreateChat} />
            )}
          </PageTitleWrapper>
          {shouldShowSearch() && <Search />}
          <ContentPage>{renderContentPage()}</ContentPage>
        </ContentDiv>
      </RightSidebar>
    </Wrapper>
  )
}

export default Sidebar
