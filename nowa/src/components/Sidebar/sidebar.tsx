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
  CreateChatButtonIcon, // import the new icon
} from '../icons/icons'
import styled from 'styled-components'
import ThemeController from '../ThemeController/ThemeController'
import Search from '../Search/search'
import NotificationPage from '../../pages/notificationPage'
import ChatListPage from '../../pages/chatListPage'

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
  width: 2.5rem;
  background-color: yellow;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.3);
  z-index: 10;
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
  align-items: flex-start; /* Left align the items */
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
  margin-bottom: 10px; /* Add margin below the PageTitle */
  align-self: flex-start; /* Make sure the title is aligned to the left */
`

const Sidebar: React.FC<SidebarProps> = ({ theme }) => {
  const [activePage, setActivePage] = useState<string>('')

  const renderContentPage = () => {
    switch (activePage) {
      case 'notifications':
        return <NotificationPage />
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

  const handleCreateChat = () => {
    // Add logic to handle chat creation
    console.log('Create new chat')
  }

  return (
    <Wrapper>
      <LeftSidebar>
        <IconButton>
          <LogoIcon theme={theme} />
        </IconButton>
        <IconButton>
          <MainIcon theme={theme} />
        </IconButton>
        <IconButton>
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
        <IconButton>
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
              <IconButton onClick={handleCreateChat}>
                <CreateChatButtonIcon theme={theme} />
              </IconButton>
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
