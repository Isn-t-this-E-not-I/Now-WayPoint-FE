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
} from '../icons/icons'
import ThemeController from '../ThemeController/ThemeController'
import Search from '../Search/search'
import NotificationPage from '../../pages/notificationPage'
import CreateChatRoomButton from '../CreateChatRoomButton/createChatRoomButton'
import { fetchChatRooms } from '../../api/chatApi'
import { useChatWebSocket, getStompClient } from '@/websocket/chatWebSocket'
import { useChat } from '../../context/chatContext'
import ChatListPage from '@/pages/Chat/chatListPage'

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
  width: 2.5rem;
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
  width: 19rem;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.3);
  z-index: 5;
  position: relative;
  margin-left: 2.5rem;
`

const Blank = styled.div`
  height: 45.5vh;
  width: 2.5rem;
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
  margin-left: 3px;
  align-self: flex-start;
`

const Sidebar: React.FC<SidebarProps> = ({
  theme,
  setSelectedPage,
}) => {
  const [activePage, setActivePage] = useState<string>('')
  const { setChatRooms, setChatRoomsInfo } = useChat()

  const token = localStorage.getItem('token') || '';
  const { connectAndSubscribe, disconnect } = useChatWebSocket()

  // activePage가 'chat'이 아닌 경우 disconnect 호출
  useEffect(() => {
    if (activePage !== 'chat') {
      disconnect();
    }
  }, [activePage]);

  // 현재 활성된 페이지에 따라 콘텐츠 렌더링
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

  return (
    <Wrapper>
      <LeftSidebar>
        <IconButton
          onClick={() => {
            setSelectedPage('main')
          }}
        >
          <LogoIcon theme={theme} />
        </IconButton>
        <IconButton
          onClick={() => {
            setSelectedPage('main')
          }}
        >
          <MainIcon theme={theme} />
        </IconButton>
        <IconButton
          onClick={() => {
            setSelectedPage('create')
          }}
        >
          <NewCreateIcon theme={theme} />
        </IconButton>
        <IconButton
          onClick={() => {
            setActivePage('notifications')
          }}
        >
          <NotificationsIcon theme={theme} />
        </IconButton>
        <IconButton
          onClick={() => {
            if (getStompClient() == null) {
              connectAndSubscribe((error) => console.error(error));
            }
            setActivePage('chat')
            fetchChatRooms(token)
              .then(data => {
                // 데이터 구조를 확인하고 필요한 데이터만 추출
                const chatRooms = data.chatRooms;
                const chatRoomsInfo = data.chatRoomsInfo;

                // state나 context에 데이터를 설정
                setChatRooms(chatRooms);
                setChatRoomsInfo(chatRoomsInfo);
              })
          }}
        >
          <ChatIcon theme={theme} />
        </IconButton>
        <IconButton
          onClick={() => {
            setActivePage('contents')
          }}
        >
          <ContentsIcon theme={theme} />
        </IconButton>
        <IconButton
          onClick={() => {
            setActivePage('followContents')
          }}
        >
          <FollowContentsIcon theme={theme} />
        </IconButton>
        <IconButton
          onClick={() => {
            setSelectedPage('myPage')
          }}
        >
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
              <CreateChatRoomButton />
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

