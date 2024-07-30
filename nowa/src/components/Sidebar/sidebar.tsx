import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
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
import { ChatRoom, ChatRoomInfo } from '../../types'
import { fetchChatRooms } from '../../api/chatApi'
import {
  connectAndSubscribe,
  disconnect,
  getStompClient,
} from '@/websocket/chatWebSocket'
import ChatListPage from '@/pages/Chat/chatListPage'
import Modal from '../Modal/modal';
import axios from 'axios';


interface SidebarProps {
  chatRooms: ChatRoom[]
  theme: 'light' | 'dark'
  onChatItemClick: (chatRoom: ChatRoom) => void
  setSelectedPage: (page: string) => void
  onExitChatRoom: (id: number) => void
  setChatRooms: React.Dispatch<React.SetStateAction<ChatRoom[]>>
  onCreateChat: (newChatRoom: ChatRoom) => void
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

const Sidebar: React.FC<SidebarProps> = ({
  chatRooms,
  theme,
  onChatItemClick,
  setSelectedPage,
  setChatRooms,
  onCreateChat,
}) => {
  const [activePage, setActivePage] = useState<string>('')
  const [chatRoomsInfo, setChatRoomsInfo] = useState<ChatRoomInfo[]>([])
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  // const [token, setToken] = useState<string>(localStorage.getItem('token') || '');
  // const [userNickname, setUserNickname] = useState<string>(localStorage.getItem('nickname') || '');

  const token =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJ0dEB0ZXN0LmNvbSIsImlhdCI6MTcyMjMwNTk1MSwiZXhwIjoxNzIyOTEwNzUxfQ.6_9WlSPqRYbbHv7VH9e53hVnQV5PQcpnc-VKDdZAHfgAahAJfcO1kDQ8EhqdBpPV'
  const userNickname = '예진스'

  // 채팅방 목록을 가져오는 useEffect 추가
  useEffect(() => {
    if (activePage === 'chat') {
      fetchChatRooms(token).then((data) => {
        setChatRooms(data.chatRooms)
        setChatRoomsInfo(data.chatRoomsInfo)
      })
    }
  }, [activePage, token])

  useEffect(() => {
    if (activePage === 'chat' && !getStompClient()) {
      connectAndSubscribe(token, userNickname, setChatRooms, (error) =>
        console.error(error)
      )
    }
  }, [activePage, token, userNickname, setChatRooms])

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
        return <NotificationPage />
      case 'chat':
        return (
          <ChatListPage
            chatRooms={chatRooms}
            chatRoomsInfo={chatRoomsInfo}
            onChatItemClick={onChatItemClick}
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

  // 검색창 보여주기 여부
  const shouldShowSearch = () => {
    return (
      activePage !== 'notifications' &&
      activePage !== 'chat' &&
      activePage !== ''
    )
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
  };

  
  const handleLogout = async () => {
    console.log(token);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://subdomain.now-waypoint.store:8080/api/user/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.removeItem('token');
      localStorage.removeItem('nickname');
      setLogoutModalOpen(false);
      window.location.href = '/login'; // 로그아웃 후 로그인 페이지로 이동
    } catch (error) {
      console.error('로그아웃에 실패했습니다:', error);
    }
  };

  return (
    <Wrapper>
      <LeftSidebar>
        <LogoIconButtonWrapper
          onClick={() => {
            setSelectedPage('main');
          }}
        >
          <LogoIcon theme={theme} />
        </LogoIconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            setSelectedPage('main');
          }}
        >
          <MainIcon theme={theme} />
        </IconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            setSelectedPage('create');
          }}
        >
          <NewCreateIcon theme={theme} />
        </IconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            setActivePage('notifications');
          }}
        >
          <NotificationsIcon theme={theme} />
        </IconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            connectAndSubscribe;
            setActivePage('chat');
          }}
        >
          <ChatIcon theme={theme} />
        </IconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            setActivePage('contents');
          }}
        >
          <ContentsIcon theme={theme} />
        </IconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            setActivePage('followContents');
          }}
        >
          <FollowContentsIcon theme={theme} />
        </IconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            navigate('/mypage'); // 마이페이지로 리디렉션
          }}
        >
          <MyPageIcon theme={theme} />
        </IconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            setLogoutModalOpen(true);
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
            {activePage === 'chat' && (
              <CreateChatRoomButton
                theme={theme}
                token={token}
                onCreateChat={onCreateChat}
              />
            )}
          </PageTitleWrapper>
          {shouldShowSearch() && (
            <SearchContainer>
              <Search />
            </SearchContainer>
          )}
          <ContentPage>{renderContentPage()}</ContentPage>
        </ContentDiv>
      </RightSidebar>
      {isLogoutModalOpen && (
        <Modal isOpen={isLogoutModalOpen} onClose={() => setLogoutModalOpen(false)}>
          <div>
            <h3>로그아웃 하시겠습니까?</h3>
            <button onClick={handleLogout}>네</button>
            <button onClick={() => setLogoutModalOpen(false)}>아니오</button>
          </div>
        </Modal>
      )}
    </Wrapper>
  );
};

export default Sidebar;
