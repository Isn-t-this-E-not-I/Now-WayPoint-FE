import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
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
} from '../icons/icons';
import ThemeController from '../ThemeController/ThemeController';
import Search from '../Search/search';
import NotificationPage from '../../pages/notificationPage';
import CreateChatRoomButton from '../CreateChatRoomButton/createChatRoomButton';
import { fetchChatRooms } from '../../api/chatApi';
import { useChatWebSocket, getStompClient } from '@/websocket/chatWebSocket'
import { useChat } from '../../context/chatContext'
import ChatListPage from '@/pages/Chat/chatListPage';
import Modal from '../Modal/modal';
import AllUserList from '../FollowList/AllUserList'
import fetchAllUsers from '@/data/fetchAllUsers';
import { handleLogout } from '../Logout/Logout';
import { WebSocketProvider } from '../WebSocketProvider/WebSocketProvider';
import FollowContentsPage from '@/pages/FollowContentsPage';
import MainSidebarPage from '@/pages/MainSidebarPage';

interface SidebarProps {
  theme: 'light' | 'dark';
}

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
`;

const LeftSidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 2.6rem;
  height: 100%;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.3);
  z-index: 10;
  position: fixed;
`;

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
`;

const Blank = styled.div`
  height: 45.5vh;
  width: 2.5rem;
`;

const LogoIconButtonWrapper = styled.button`
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
`;

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
`;

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
`;

const ContentPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

const PageTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const PageTitle = styled.div`
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 10px;
  margin-left: 6px;
  align-self: flex-start;
`;

const SearchContainer = styled.div`
  margin-left: 6px;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const Sidebar: React.FC<SidebarProps> = ({
  theme,
}) => {
  const [activePage, setActivePage] = useState<string>('')
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false)
  const navigate = useNavigate()
  const { connectAndSubscribe, disconnect } = useChatWebSocket()
  const { setChatRooms, setChatRoomsInfo, setActiveChatRoomId } = useChat()

  const [token] = useState<string>(localStorage.getItem('token') || '');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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
  }, [activePage]);


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
        );
      case 'notifications':
        return (
          <div>
            <WebSocketProvider>
              <NotificationPage />
            </WebSocketProvider>
          </div>
        );
      case 'chat':
        return (
          <ChatListPage />
        );
      case 'contents':
        return (
          <div>
            <WebSocketProvider>
              <MainSidebarPage />
            </WebSocketProvider>
          </div>
        );
      case 'followContents':
        return (
          <div>
            <WebSocketProvider>
              <FollowContentsPage />
            </WebSocketProvider>
          </div>
        );
      default:
        return (
          <div>
            <WebSocketProvider>
              <MainSidebarPage />
            </WebSocketProvider>
          </div>
        );
    }
  };

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
    );
  };

  // 현재 페이지 제목
  const getPageTitle = () => {
    switch (activePage) {
      case 'main':
        return '메인';
      case 'notifications':
        return '알림';
      case 'chat':
        return '메시지';
      case 'contents':
        return '주변 컨텐츠';
      case 'followContents':
        return '팔로우 컨텐츠';
      case 'myPage':
        return '마이페이지'
      default:
        return '';
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleNavigate = (page: string) => {
    navigate(`/${page}`)
  }

  return (
    <Wrapper>
      <LeftSidebar>
        <LogoIconButtonWrapper
          onClick={() => {
            handleNavigate('main');
            setActivePage('main');
          }}
        >
          <LogoIcon theme={theme} />
        </LogoIconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            handleNavigate('main');
            setActivePage('main');
          }}
        >
          <MainIcon theme={theme} />
        </IconButtonWrapper>
        <IconButtonWrapper
          onClick={() => {
            handleNavigate('uploadContent')
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
            if (getStompClient() == null) {
              connectAndSubscribe();
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
            setActivePage('myPage')
            handleNavigate('mypage')
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
      {/* ----------------------------------- */}
      <RightSidebar>
        <NowaIcon theme={theme} />
        <ContentDiv>
          <PageTitleWrapper>
            <PageTitle>{getPageTitle()}</PageTitle>
            {activePage === 'chat' && (
              <CreateChatRoomButton />
            )}
          </PageTitleWrapper>
          {shouldShowSearch() && (
            <SearchContainer>
              <Search />
            </SearchContainer>
          )}
          {activePage === 'myPage' && ( // myPage일 때만 전체 유저 검색 기능 표시
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="전체 유저 검색"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <AllUserList
                users={allUsers}
                searchQuery={searchQuery}
              />
            </SearchContainer>
          )}
          <ContentPage>{renderContentPage()}</ContentPage>
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
      )
      }
    </Wrapper >
  )
}

export default Sidebar;
