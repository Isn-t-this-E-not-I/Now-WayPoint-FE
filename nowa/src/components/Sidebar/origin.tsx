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
// import { WebSocketProvider } from '../WebSocketProvider/WebSocketProvider'
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

const TopRightSidebar = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  padding-right: 10px;
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

// const LogoutDropdown = styled.div`
//   position: absolute;
//   top: 15px;
//   left: 40px;
//   width: 200px;
//   background-color: white;
//   box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
//   padding: 10px;
//   border-radius: 8px;
//   z-index: 10;
//   transition: transform 0.5s ease;

//   h3 {
//     margin: 0 0 10px 0;
//   }

//   button {
//     margin: auto 15px;
//     &:hover {
//       transform: scale(1.2);
//     }
//   }
// `

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
        return <MainSidebarPage />
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

  const handleDelete = () => {
    //notifications에 데이터 제거
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
          onClick={() => {
            handleNavigate('main')
            setActivePage('main')
          }}
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
          onClick={() => {
            setActivePage('notifications')
          }}
        >
          <NotificationsIcon theme={theme} />
          <IconSpan active={activePage === 'notifications'}>알림</IconSpan>
          {notifyCount > 1 && <Badge>{Math.floor(notifyCount / 2)}</Badge>}
        </IconButtonWrapper>
        <IconButtonWrapper
          id="chat-icon"
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
          id="contents-icon"
          active={activePage === 'contents'}
          onClick={() => {
            setActivePage('contents')
          }}
        >
          <ContentsIcon theme={theme} />
          <IconSpan active={activePage === 'contents'}>주변 컨텐츠</IconSpan>
        </IconButtonWrapper>
        <IconButtonWrapper
          id="follow-contents-icon"
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
          id="mypage-icon"
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
        </LogOutIconButtonWrapper>
        <Blank />
        <ThemeController />
      </LeftSidebar>

      <Line />

      <RightSidebar>
        <TopRightSidebar>
          <NowaIcon theme={theme} />
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
      {isUploadModalOpen && (
        <Modal
          isOpen={isUploadModalOpen}
          showCloseButton={false}
          onClose={() => setUploadModalOpen(false)}
          disableOverlayClick={true}
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

// import React, { useState, useEffect } from 'react';
// import { useCookies } from 'react-cookie';
// import { login, register, sendLoginInfo } from '../../api/userApi';
// import TextInput from '../../components/TextInput/textInput';
// import { useNavigate } from 'react-router-dom';
// import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
// import './styles.css';

// const AuthPage: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
//   const [loginId, setLoginId] = useState<string>('');
//   const [password, setPassword] = useState<string>('');
//   const [nickname, setNickname] = useState('');
//   const [rememberMe, setRememberMe] = useState<boolean>(false);
//   const [error, setError] = useState<string>('');
//   const location = import.meta.env.VITE_APP_API;
//   const [cookies, setCookie, removeCookie] = useCookies(['rememberedLoginId']);
//   const [hidePassword, setHidePassword] = useState(true);

//   const navigate = useNavigate();

//   useEffect(() => {
//     if (cookies.rememberedLoginId) {
//       setLoginId(cookies.rememberedLoginId);
//       setRememberMe(true);
//     }
//   }, [cookies]);

//   useEffect(() => {
//     const handleEnterPress = (event: KeyboardEvent) => {
//       if (event.key === 'Enter') {
//         handleLogin();
//       }
//     };

//     window.addEventListener('keydown', handleEnterPress);
//     return () => {
//       window.removeEventListener('keydown', handleEnterPress);
//     };
//   }, [loginId, password]);

//   const handleLogin = async () => {
//     try {
//       const data = await login({ loginId, password });
//       await sendLoginInfo(loginId);
//       console.log('로그인 성공:', data.token);
//       navigate('/main', { replace: true });
//       localStorage.setItem('token', data.token);
//       localStorage.setItem('nickname', data.nickname);
//       setNickname(data.nickname);

//       if (rememberMe) {
//         setCookie('rememberedLoginId', loginId, {
//           path: '/',
//           maxAge: 30 * 24 * 60 * 60,
//         });
//       } else {
//         removeCookie('rememberedLoginId');
//       }
//     } catch (error) {
//       console.error('로그인 실패:', error);
//       setError('로그인에 실패하였습니다. 아이디 또는 비밀번호를 확인하세요.');
//     }
//   };

//   const handleKakaoLogin = async () => {
//     try {
//       localStorage.setItem('token', 'zzz');
//       window.location.href = `${location}/user/login/kakao`;
//     } catch (error) {
//       console.error('Kakao login failed:', error);
//     }
//   };

//   const onToggleHide = () => {
//     setHidePassword(!hidePassword);
//   };

//   const handleRegister = async (loginId: string, password: string, email: string, nickname: string) => {
//     try {
//       const data = await register({ loginId, password, email, nickname, name: nickname });
//       console.log('회원가입 성공:', data);
//       navigate('/main', { replace: true });
//     } catch (error) {
//       console.error('회원가입 실패:', error);
//       setError('회원가입에 실패하였습니다. 정보를 확인하세요.');
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-image">
//       <div className="card w-96 p-5" style={{ marginTop: '5rem', marginLeft: '30rem', minHeight: '550px' }}>
//       <div className="flex justify-center mb-4">
//         <button
//             className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
//             onClick={() => setActiveTab('login')}
//         >
//             로그인
//         </button>
//         <button
//             className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
//             onClick={() => setActiveTab('register')}
//         >
//             회원가입
//         </button>
//         </div>

//         {activeTab === 'login' && (
//           <>
//             <TextInput
//               type="email"
//               placeholder="이메일"
//               onChange={(e) => setLoginId(e.target.value)}
//               value={loginId}
//               className="mb-4"
//               style={{ color: 'black', backgroundColor: '#EAF0F7', border: 'none' }}  // 텍스트 색상: 검정색, 배경색: 연회색
//             />
//             <div className="relative w-full mb-2">
//               <TextInput
//                 type={hidePassword ? 'password' : 'text'}
//                 placeholder="비밀번호"
//                 onChange={(e) => setPassword(e.target.value)}
//                 value={password}
//                 className="mb-4"
//                 style={{ color: 'black', backgroundColor: '#EAF0F7', border: 'none' }}  // 텍스트 색상: 검정색, 배경색: 연회색
//               />
//               <div
//                 className="absolute inset-y-0 right-0 mb-4 mr-2 pr-3 flex items-center cursor-pointer"
//                 onClick={onToggleHide}
//               >
//                 {hidePassword ? <AiFillEye /> : <AiFillEyeInvisible />}
//               </div>
//             </div>
//             <div className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={() => setRememberMe(!rememberMe)}
//                 className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
//               />
//               <label className="block text-gray-700">아이디 저장</label>
//             </div>
//             {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
//             <button
//               className="btn mt-4"
//               style={{ backgroundColor: '#1778F2', color: 'white', borderColor: '#1778F2', borderWidth: '0px', fontWeight: '900', fontSize: '15px'}}
//               onClick={handleLogin}
//             >
//               로그인
//             </button>
//             <button
//               className="btn mt-2"
//               style={{ backgroundColor: '#ffeb3b', color: 'black', fontWeight: '900', fontSize: '15px' }}
//               onClick={handleKakaoLogin}
//             >
//               카카오 로그인
//             </button>
//             {/* <button
//               className="btn mt-2"
//               style={{ backgroundColor: 'transparent', borderColor: '#007bff', color: '#007bff' }}
//               onClick={() => setActiveTab('register')}
//             >
//               회원가입
//             </button> */}
//           </>
//         )}

//         {activeTab === 'register' && (
//           <RegisterForm handleRegister={handleRegister} />
//         )}
//       </div>
//     </div>
//   );
// };

// interface RegisterFormProps {
//   handleRegister: (loginId: string, password: string, email: string, nickname: string) => void;
// }

// const RegisterForm: React.FC<RegisterFormProps> = ({ handleRegister }) => {
//   const [loginId, setLoginId] = useState<string>('');
//   const [password, setPassword] = useState<string>('');
//   const [email, setEmail] = useState<string>('');
//   const [nickname, setNickname] = useState<string>('');
//   const [hidePassword, setHidePassword] = useState(true);

//   const onToggleHide = () => {
//     setHidePassword(!hidePassword);
//   };

//   const onSubmit = () => {
//     handleRegister(loginId, password, email, nickname);
//   };

//     function setActiveTab(arg0: string): void {
//         throw new Error('Function not implemented.');
//     }

//   return (
//     <>
//       <TextInput
//         type="text"
//         placeholder="아이디"
//         onChange={(e) => setLoginId(e.target.value)}
//         value={loginId}
//         className="mb-4"
//       />
//       <TextInput
//         type="email"
//         placeholder="이메일"
//         onChange={(e) => setEmail(e.target.value)}
//         value={email}
//         className="mb-4"
//       />
//       <div className="relative w-full mb-2">
//         <TextInput
//           type={hidePassword ? 'password' : 'text'}
//           placeholder="비밀번호"
//           onChange={(e) => setPassword(e.target.value)}
//           value={password}
//           className="mb-4"
//         />
//         <div
//           className="absolute inset-y-0 right-0 mb-4 mr-2 pr-3 flex items-center cursor-pointer"
//           onClick={onToggleHide}
//         >
//           {hidePassword ? <AiFillEye /> : <AiFillEyeInvisible />}
//         </div>
//       </div>
//       <TextInput
//         type="text"
//         placeholder="닉네임"
//         onChange={(e) => setNickname(e.target.value)}
//         value={nickname}
//         className="mb-4"
//       />
//       <button className="btn btn-primary mt-4" onClick={onSubmit}>
//         회원가입
//       </button>
//       <button className="btn btn-outline mt-4" onClick={() => setActiveTab('login')}>
//         로그인 페이지로
//       </button>
//     </>
//   );
// };

// export default AuthPage;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getAllUsers, addFollow } from '../../api/userApi';
// import Button from '../../components/Button/button';
// import TextInput from '../../components/TextInput/textInput';
// import './styles.css';
// import { FaSearch, FaPlus, FaCheck } from "react-icons/fa";

// interface User {
//   name: string;
//   nickname: string;
//   profileImageUrl: string;
// }

// const FriendAdditionPage: React.FC = () => {
//   const [showFriendPrompt, setShowFriendPrompt] = useState(true);
//   const [transitioning, setTransitioning] = useState(false);
//   const [completedTransition, setCompletedTransition] = useState(false);
//   const [nickname, setNickname] = useState<string>('');
//   const [searchQuery, setSearchQuery] = useState<string>('');
//   const [searchResults, setSearchResults] = useState<User[]>([]);
//   const [selectedFriends, setSelectedFriends] = useState<User[]>([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedNickname = localStorage.getItem('nickname');
//     if (storedNickname) {
//       setNickname(storedNickname);
//     }
//   }, []);

//   const handleFindFriends = () => {
//     setTransitioning(true);
//     setTimeout(() => {
//       setShowFriendPrompt(false);
//       setTransitioning(false);
//       setCompletedTransition(true);
//     }, 1000);
//   };

//   const handleSkip = () => {
//     navigate('/onboarding/distance-add');
//   };

//   const handleSearch = async () => {
//     if (!searchQuery) {
//       setSearchResults([]);
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       if (token) {
//         const users = await getAllUsers(token);
//         const results = users.filter((user: User) =>
//           user.name.includes(searchQuery) || user.nickname.includes(searchQuery)
//         );
//         setSearchResults(results);
//       } else {
//         console.error('No token found');
//       }
//     } catch (error) {
//       console.error('Error searching users:', error);
//     }
//   };

//   const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
//     if (event.key === 'Enter') {
//       handleSearch();
//     }
//   };

//   const handleAddFriend = (friend: User) => {
//     setSelectedFriends([...selectedFriends, friend]);
//     setSearchResults(searchResults.filter(user => user.nickname !== friend.nickname));
//   };

//   const handleRemoveFriend = (nickname: string) => {
//     const removedFriend = selectedFriends.find(friend => friend.nickname === nickname);
//     if (removedFriend) {
//       setSelectedFriends(selectedFriends.filter(friend => friend.nickname !== nickname));
//       setSearchResults([...searchResults, removedFriend]);
//     }
//   };

//   const handleAddFollow = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (token) {
//         await Promise.all(selectedFriends.map(friend => addFollow(token, friend.nickname)));
//         navigate('/onboarding/distance-add');
//       } else {
//         console.error('No token found');
//       }
//     } catch (error) {
//       console.error('Error adding follow:', error);
//     }
//   };

//   return (
//     <div className="relative min-h-screen bg-cover bg-center bg-blue-300">
//       {showFriendPrompt ? (
//         <div className={`flex flex-col items-center justify-center min-h-screen transition-all transform ${transitioning ? 'translate-x-full' : 'translate-x-0'}`}>
//           <h2 className="text-2xl font-bold text-white mb-6">환영합니다, 이제 친구를 찾아볼까요?</h2>
//           <Button
//             className="btn-primary text-lg mt-16 w-64 h-14 bg-pink-500 text-white hover:bg-pink-600 border-none"
//             onClick={handleFindFriends}
//           >
//             친구 선택하기
//           </Button>
//           <Button
//             className="btn-primary text-lg mt-4 w-64 h-14 bg-gray-300 text-white hover:bg-gray-400 border-none"
//             onClick={handleSkip}
//           >
//             건너뛰기
//           </Button>
//         </div>
//       ) : (
//         <div className={`flex flex-col items-center justify-center min-h-screen transition-all transform ${completedTransition ? 'translate-x-0' : 'translate-x-full'}`}>
//           <h2 className="text-2xl font-bold mb-12 text-white">친구의 닉네임을 검색하세요</h2>
//           <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg overflow-hidden">
//             <div className="flex mb-4 w-full">
//               <TextInput
//                 type="text"
//                 placeholder="친구 검색"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 className="flex-grow border-none p-4 w-full bg-gray-100 rounded-200 mr-40"
//               />
//               <Button
//                 onClick={handleSearch}
//                 className="ml-2 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-200"
//               >
//                 <FaSearch />
//               </Button>
//             </div>
//             <ul className="mb-4">
//               {searchResults.map((user: User) => (
//                 <li key={user.nickname} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-2">
//                   <div className="flex items-center">
//                     <img
//                       src={user.profileImageUrl}
//                       alt={user.name}
//                       className="w-10 h-10 rounded-full mr-4"
//                     />
//                       <p className="text-black">{user.nickname}</p>
//                       <p className="text-gray-500 ml-0.5">({user.name})</p>
//                   </div>
//                   {selectedFriends.some(friend => friend.nickname === user.nickname) ? (
//                     <FaCheck
//                       onClick={() => handleRemoveFriend(user.nickname)}
//                       className="text-green-500 cursor-pointer"
//                     />
//                   ) : (
//                     <FaPlus
//                       onClick={() => handleAddFriend(user)}
//                       className="text-blue-500 cursor-pointer"
//                     />
//                   )}
//                 </li>
//               ))}
//             </ul>
//             <Button
//               className="btn-primary text-base mt-4 w-full h-10 rounded-lg bg-pink-500 text-white hover:bg-pink-600 border-none"
//               onClick={handleAddFollow}
//             >
//               친구 {selectedFriends.length}명 추가
//             </Button>
//             {selectedFriends.length > 0 && (
//               <div className="mt-4">
//                 <ul>
//                   {selectedFriends.map((friend: User) => (
//                     <li key={friend.nickname} className="flex items-center justify-between p-4 bg-blue-100 rounded-lg mb-2">
//                       <div className="flex items-center">
//                         <img
//                           src={friend.profileImageUrl}
//                           alt={friend.name}
//                           className="w-10 h-10 rounded-full mr-4"
//                         />
//                           <p className="text-black">{friend.nickname}</p>
//                           <p className="text-gray-500 ml-0.5">({friend.name})</p>
//                       </div>
//                       <FaCheck
//                         onClick={() => handleRemoveFriend(friend.nickname)}
//                         className="text-green-500 cursor-pointer"
//                       />
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FriendAdditionPage;

// import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import styled from 'styled-components'
// import {
//   ChatIcon,
//   ContentsIcon,
//   FollowContentsIcon,
//   LogoIcon,
//   MainIcon,
//   MyPageIcon,
//   NewCreateIcon,
//   NotificationsIcon,
//   NowaIcon,
//   ExitIcon,
// } from '../icons/icons'
// import Search from '../Search/search'
// import NotificationPage from '../../pages/notificationPage'
// import CreateChatRoomButton from '../Chat/createChatRoomButton'
// import { fetchChatRooms } from '../../api/chatApi'
// import {
//   useChatWebSocket,
//   getStompClient,
//   setActiveChatRoomPage,
// } from '@/websocket/chatWebSocket'
// import { useChat } from '../../context/chatContext'
// import ChatListPage from '@/pages/Chat/chatListPage'
// import Modal from '../Modal/modal'
// import AllUserList from '../FollowList/AllUserList'
// import fetchAllUsers from '@/data/fetchAllUsers'
// import { handleLogout } from '../Logout/Logout'
// import FollowContentsPage from '@/pages/FollowContentsPage'
// import MainSidebarPage from '@/pages/MainSidebarPage'
// import MakeContent from '@/pages/MakeContent/makeContent'
// import { useWebSocket } from '../WebSocketProvider/WebSocketProvider'
// import Button from '../Button/button'
// import axios from 'axios';
// import defaultProfileImage from '../../../../defaultprofile.png';

// interface SidebarProps {
//   theme: 'light' | 'dark'
// }

// const Wrapper = styled.div`
//   display: flex;
//   height: 100vh;
//   justify-content: space-between;
// `

// const LeftSidebar = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   width: 16rem;
//   height: 100%;
//   z-index: 10;
//   position: fixed;
//   background-color: #f8faff;
// `

// const RightSidebar = styled.div<{ isVisible: boolean }>`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: flex-start;
//   width: 20rem; // RightSidebar 너비 설정
//   box-shadow: 3px 0 10px rgba(0, 0, 0, 0.05);
//   z-index: 5;
//   position: fixed;
//   top: 0;
//   left: ${({ isVisible }) => (isVisible ? '15rem' : '-15rem')};
//   height: 100%;
//   background-color: #f8faff;
//   transition: left 0.3s ease-in-out;
// `
// const TopRightSidebar = styled.div`
//   display: flex;
//   align-items: center;
//   width: 100%;
//   justify-content: space-between;
//   padding-right: 10px;
// `

// const RightSection = styled.div`
//   width: 18rem;
//   height: 100%;
//   position: fixed;
//   right: 0;
//   background-color: #f8faff;
//   display: flex;
//   flex-direction: column;
//   align-items: flex-start;
//   justify-content: flex-start;
//   padding-top: 2rem;
//   padding-left: 2rem;
//   padding-right: 2rem;
//   box-sizing: border-box;
//   z-index: 10;
// `;

// const RightSectionContainer = styled.div`
//   width: 100%;
//   max-width: 990px;
//   height: 95vh;
//   background-color: #ffffff;
//   border-radius: 15px;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   overflow: hidden;
//   z-index: 100;
// `;

// const ProfileContainer = styled.div`
//   display: flex;
//   align-items: center;
//   width: 100%;
//   margin-bottom: 10px;
// `;

// const ProfileImage = styled.img`
//   width: 45px;
//   height: 45px;
//   border-radius: 50%;
//   margin-right: 15px;
// `;

// const UserInfo = styled.div`
//   display: flex;
//   flex-direction: column;
//   margin-right: 10px;
// `;

// const Nickname = styled.span`
//   font-weight: bold;
//   font-size: 14px;
// `;

// const LoginId = styled.span`
//   color: #888;
//   font-size: 14px;
// `;

// const Name = styled.span`
//   color: #888;
//   font-size: 14px;
// `;

// const LogOutIconButtonWrapper = styled.button`
//   background: none;
//   border: none;
//   cursor: pointer;
//   padding-bottom: 1.5rem;
//   display: flex;
//   align-items: center;
//   margin-left: auto; /* 오른쪽 정렬 */
//   margin-right: 10px; /* 오른쪽 정렬 */
//   svg {
//     width: 18px;
//     height: 18px;
//   }
// `;

// const RecommendationsContainer = styled.div`
//   width: 100%;
//   margin-top: 20px;
//   max-height: 190px; /* 스크롤 영역의 최대 높이 설정 */
//   overflow-y: auto; /* 수직 스크롤 추가 */
// `;

// const RecommendationTitle = styled.h3`
//   font-size: 15px;
//   font-weight: bold;
//   margin-top: 15px;
//   margin-bottom: 0px;
// `;

// const RecommendationList = styled.ul`
//   list-style: none;
//   padding: 0;
//   margin: 0;
//   width: 100%;
// `;

// const RecommendationItem = styled.li`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   margin-bottom: 10px;
//   width: 100%;
// `;

// const ShowMoreText = styled.div<{ visible: boolean }>`
//   display: ${({ visible }) => (visible ? 'block' : 'none')};
//   text-align: center;
//   font-size: 14px;
//   color: #888;
//   margin-top: 10px;
// `;

// const FollowButton = styled.button`
//   margin-left: auto;
//   margin-bottom: 0.8rem;
//   padding: 0.2rem 0.7rem;
//   background-color: black;
//   color: white;
//   border: none;
//   border-radius: 10px;
//   cursor: pointer;
//   font-size: 13px;
//   height: 35px;
//   width: 80px;

//   &:hover {
//     background-color: rgba(0, 0, 0, 0.6);
//   }

//   &:focus {
//     outline: none;
//   }
// `;

// const Blank = styled.div`
//   height: 45.5vh;
//   width: 2.5rem;
// `

// const LogoIconButtonWrapper = styled.button`
//   background: none;
//   border: none;
//   cursor: pointer;
//   padding: 0;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   margin-bottom: 25px;
//   margin-left: -9.1rem;
//   &:focus {
//     outline: none;
//   }
// `

// const IconButtonWrapper = styled.button.attrs<{ active: boolean }>((props) => ({
//   active: props.active,
// }))<{ active: boolean }>`
//   background: ${({ active }) =>
//     active ? 'black' : 'none'};
//   border: none;
//   cursor: pointer;
//   padding-left: 0.7rem;
//   display: flex;
//   align-items: center;
//   width: 80%;
//   height: 70px;
//   left: 0;
//   border-radius: 20px;
//   justify-content: flex-start;
//   position: relative;

//   &:focus {
//     outline: none;
//     background-color: black;
//     color: white;

//     svg {
//       fill: white;
//     }

//     span {
//       color: white;
//     }
//   }

//   &:hover {
//     background-color: black;

//     svg {
//       fill: white;
//     }

//     span {
//       color: white;
//     }
//   }

//   svg {
//     fill: ${({ active }) => (active ? 'white' : '#151515')};
//     margin-right: 1rem;
//     margin-top: -1.25rem;
//   }
// `;

// const IconSpan = styled.span<{ active: boolean }>`
//   font-size: 14px;
//   font-weight: bold;
//   color: ${({ active }) => (active ? 'white' : '#151515')};
// `;

// const CreateChatRoomButtonWrapeer = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   margin-left: 10px;
//   margin-top: 0.5px;
// `

// const ContentDiv = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: flex-start;
//   justify-content: flex-start;
//   height: 100%;
//   width: 100%;
//   padding: 10px;
//   margin-top: 5px;
//   position: relative;
// `

// const ContentPage = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   height: 100%;
//   width: 100%;
// `

// const SearchContainer = styled.div`
//   margin-left: 6px;
//   width: 99.5%;
// `

// const SearchInput = styled.input`
//   width: 90%;
//   padding: 9px;
//   margin-bottom: 20px;
//   margin-left: 10px;
//   border: 0.1px solid #ccc;
//   border-radius: 8px;
//   font-size: 15px;
// `

// const Badge = styled.span`
//   position: absolute;
//   top: 1.79rem;
//   right: 1.5rem;
//   width: 1.4rem;
//   height: 1.4rem;
//   background-color: rgba(0, 0, 0, 0.9);
//   color: white;
//   border-radius: 50%;
//   padding: 2px 6px;
//   font-size: 12px;
//   font-weight: bold;
//   line-height: 1;
//   display: flex;
//   align-items: center;
//   justify-content: center;
// `

// const DeleteNotificationsButton = styled.span`
//   position: absolute;
//   top: 50px;
//   right: 15px;
//   background-color: #9269b2;
//   color: #fdfdfd;
//   border-radius: 5px;
//   padding: 7px 14px;
//   font-size: 12px;
//   font-weight: bold;
//   line-height: 1;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   cursor: pointer;
//   &:hover {
//     transform: scale(1.03);
//   }
// `

// const Sidebar: React.FC<SidebarProps> = ({ theme }) => {
//   const [activePage, setActivePage] = useState<string>('')
//   const [isUploadModalOpen, setUploadModalOpen] = useState(false)
//   const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
//   const [userInfo, setUserInfo] = useState<null | {
//     profileImageUrl: string;
//     nickname: string;
//     loginId: string;
//   }>(null);
//   const [recommendations, setRecommendations] = useState<any[]>([]);

//   const navigate = useNavigate()
//   const { connectAndSubscribe, disconnect } = useChatWebSocket()
//   const { setChatRooms, setChatRoomsInfo } = useChat()

//   const [token] = useState<string>(localStorage.getItem('token') || '')
//   const [allUsers, setAllUsers] = useState<any[]>([])
//   const [searchQuery, setSearchQuery] = useState('')
//   const { notifyCount, deleteNotificationAll, notifications } = useWebSocket()
//   const [isScrolled, setIsScrolled] = useState(false);

//   const nickname = localStorage.getItem('nickname')
//   const location = import.meta.env.VITE_APP_API

//   const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
//     const { scrollTop } = event.currentTarget;
//     setIsScrolled(scrollTop > 0);
//   };

//   const handleNavigate = (page: string) => {
//     if (activePage === page) {
//       setActivePage('')  // 이미 활성화된 페이지를 다시 클릭하면 페이지를 닫음
//     }  else {
//       setActivePage(page);
//       if (page === 'main') {
//         navigate('/main'); // 메인 아이콘 클릭 시 /main으로 이동
//       } else if (page === 'myPage'){
//         navigate('/myPage');
//       } else if (page === 'chat') {
//         if (getStompClient() == null) {
//           connectAndSubscribe();
//         }
//         fetchChatRooms(token).then((data) => {
//           const chatRooms = data.chatRooms;
//           const chatRoomsInfo = data.chatRoomsInfo;
//           setChatRooms(chatRooms);
//           setChatRoomsInfo(chatRoomsInfo);
//         });
//       }
//     }
//   }

//   // 전체 유저 목록 가져오기
//   useEffect(() => {
//     console.log('notifyCount :', notifyCount)
//     const getAllUsers = async () => {
//       const users = await fetchAllUsers()
//       setAllUsers(users)
//     }
//     getAllUsers()
//   }, [])

//   // activePage가 'chat'이 아닌 경우 disconnect 호출
//   useEffect(() => {
//     if (activePage === 'main' || activePage === 'myPage') {
//       disconnect()
//       setActiveChatRoomPage(-1)
//     }
//   }, [activePage])

//   const handleDelete = () => {
//     //notifications에 데이터 제거
//     deleteNotificationAll()

//     // 알림 삭제를 위한 API 호출
//     const deleteNotifications = async () => {
//       try {
//         const token = localStorage.getItem('token') // 토큰 가져오기
//         if (!token) {
//           throw new Error('No token found')
//         }

//         const response = await fetch(`${location}/notify/all`, {
//           method: 'DELETE',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           }, // 삭제할 알림의 ID를 body에 포함
//           body: JSON.stringify({ nickname: nickname }),
//         })

//         if (!response.ok) {
//           throw new Error('Network response was not ok')
//         }
//       } catch (error) {
//         console.error('Failed to delete notification:', error)
//       }
//     }

//     deleteNotifications()
//   }

//   // 검색창 보여주기 여부
//   const shouldShowSearch = () => {
//     return (
//       activePage !== 'notifications' &&
//       activePage !== 'followContents' &&
//       activePage !== 'chat' &&
//       activePage !== 'myPage' &&
//       activePage !== 'main' &&
//       activePage !== 'contents' &&
//       activePage !== ''
//     )
//   }

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value)
//   }

//   // 오른쪽 섹션
//   useEffect(() => {
//     const fetchUserData = async () => {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       try {
//         const response = await axios.get(`${location}/user`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         setUserInfo({
//           profileImageUrl: response.data.profileImageUrl || defaultProfileImage,
//           nickname: response.data.nickname,
//           loginId: response.data.loginId, // loginId를 표시
//         });

//         // 추천 친구 목록 가져오기
//         const allUsersResponse = await axios.get(`${location}/user/all`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const followingResponse = await axios.get(`${location}/follow/following`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const followingNicknames = followingResponse.data.map((user: any) => user.nickname);

//         const notFollowingUsers = allUsersResponse.data.filter(
//           (user: any) => !followingNicknames.includes(user.nickname)
//         );

//         setRecommendations(notFollowingUsers); //
//       } catch (error) {
//         console.error('Failed to fetch user data:', error);
//       }
//     };

//     fetchUserData();
//   }, [navigate]);

//   const handleFollow = async (nickname: string) => {
//     const token = localStorage.getItem('token');
//     if (!token) return;

//     try {
//       await axios.put(
//         `${location}/follow/add`,
//         { nickname },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       // 팔로우 후 추천 목록에서 해당 유저 제거
//       setRecommendations((prevRecommendations) =>
//         prevRecommendations.filter((user) => user.nickname !== nickname)
//       );
//     } catch (error) {
//       console.error('Error following user:', error);
//     }
//   };

//   // 현재 활성된 페이지에 따라 콘텐츠 렌더링
//   const renderContentPage = () => {
//     switch (activePage) {
//       case 'main':
//         return <MainSidebarPage />
//       case 'notifications':
//         return <NotificationPage />
//       case 'chat':
//         return <ChatListPage />
//       case 'contents':
//         return <MainSidebarPage />
//       case 'followContents':
//         return <FollowContentsPage />
//       case 'myPage':
//         return <div></div>
//       default:
//         return <MainSidebarPage />
//     }
//   }

//   return (
//     <Wrapper>
//       <LeftSidebar>
//         <LogoIconButtonWrapper onClick={() => handleNavigate('main')}>
//           <LogoIcon theme={theme} />
//         </LogoIconButtonWrapper>
//         <IconButtonWrapper
//           id="main-icon"
//           active={activePage === 'main'}
//           onClick={() => handleNavigate('main')}
//         >
//           <MainIcon theme={theme} />
//           <IconSpan active={activePage === 'main'}>메인</IconSpan>
//         </IconButtonWrapper>
//         <IconButtonWrapper
//           id="new-post-icon"
//           active={isUploadModalOpen}
//           onClick={() => {
//             setUploadModalOpen(true) // 모달 열기
//           }}
//         >
//           <NewCreateIcon theme={theme} />
//           <IconSpan active={isUploadModalOpen}>새 게시물</IconSpan>
//         </IconButtonWrapper>
//         <IconButtonWrapper
//           id="notifications-icon"
//           active={activePage === 'notifications'}
//           onClick={() => handleNavigate('notifications')}
//         >
//           <NotificationsIcon theme={theme} />
//           <IconSpan active={activePage === 'notifications'}>알림</IconSpan>
//           {notifyCount > 1 && <Badge>{Math.floor(notifyCount / 2)}</Badge>}
//         </IconButtonWrapper>
//         <IconButtonWrapper
//           id="chat-icon"
//           active={activePage === 'chat'}
//           onClick={() => {
//             if (getStompClient() == null) {
//               connectAndSubscribe()
//             }
//             handleNavigate('chat')
//             fetchChatRooms(token).then((data) => {
//               const chatRooms = data.chatRooms
//               const chatRoomsInfo = data.chatRoomsInfo

//               setChatRooms(chatRooms)
//               setChatRoomsInfo(chatRoomsInfo)
//             })
//           }}
//         >
//           <ChatIcon theme={theme} />
//           <IconSpan active={activePage === 'chat'}>메시지</IconSpan>
//         </IconButtonWrapper>
//         <IconButtonWrapper
//           id="contents-icon"
//           active={activePage === 'contents'}
//           onClick={() => handleNavigate('contents')}
//         >
//           <ContentsIcon theme={theme} />
//           <IconSpan active={activePage === 'contents'}>주변 컨텐츠</IconSpan>
//         </IconButtonWrapper>
//         <IconButtonWrapper
//           id="follow-contents-icon"
//           active={activePage === 'followContents'}
//           onClick={() => handleNavigate('followContents')}
//         >
//           <FollowContentsIcon theme={theme} />
//           <IconSpan active={activePage === 'followContents'}>
//             팔로우 컨텐츠
//           </IconSpan>
//         </IconButtonWrapper>
//         <IconButtonWrapper
//           id="mypage-icon"
//           active={activePage === 'myPage'}
//           onClick={() => {
//             handleNavigate('myPage')
//           }}
//         >
//           <MyPageIcon theme={theme} />
//           <IconSpan active={activePage === 'myPage'}>마이 페이지</IconSpan>
//         </IconButtonWrapper>
//         <Blank />
//       </LeftSidebar>

//       <RightSidebar isVisible={activePage !== ''}>
//         <TopRightSidebar>
//           <NowaIcon theme={theme} />
//           {activePage === 'chat' && (
//             <CreateChatRoomButtonWrapeer>
//               <CreateChatRoomButton />
//             </CreateChatRoomButtonWrapeer>
//           )}
//         </TopRightSidebar>
//         <TopRightSidebar>
//           {activePage === 'notifications' && notifications.length > 0 && (
//             <DeleteNotificationsButton onClick={handleDelete}>
//               전체 삭제
//             </DeleteNotificationsButton>
//           )}
//         </TopRightSidebar>
//         <ContentDiv>
//           {shouldShowSearch() && (
//             <SearchContainer>
//               <Search />
//             </SearchContainer>
//           )}
//           {activePage === 'myPage' && (
//             <SearchContainer>
//               <SearchInput
//                 type="text"
//                 placeholder="전체 유저 검색"
//                 value={searchQuery}
//                 onChange={handleSearchChange}
//               />
//               <AllUserList users={allUsers} searchQuery={searchQuery} />
//             </SearchContainer>
//           )}
//           <ContentPage>{renderContentPage()}</ContentPage>
//         </ContentDiv>
//       </RightSidebar>

//       {/* Right Section */}
//       <RightSection>
//         {userInfo && (
//           <ProfileContainer>
//             <ProfileImage src={userInfo.profileImageUrl} alt="Profile" />
//             <UserInfo>
//               <Nickname>{userInfo.nickname}</Nickname>
//               <LoginId>{userInfo.loginId}</LoginId>
//             </UserInfo>
//             <LogOutIconButtonWrapper onClick={() => setLogoutModalOpen(true)}>
//               <ExitIcon theme="light" />
//             </LogOutIconButtonWrapper>
//           </ProfileContainer>
//         )}

//       <RecommendationTitle>추천 친구</RecommendationTitle>
//         <RecommendationsContainer onScroll={handleScroll}>
//           <RecommendationList>
//             {recommendations.map((user) => (
//               <RecommendationItem key={user.nickname}>
//                 <ProfileContainer>
//                   <ProfileImage src={user.profileImageUrl || defaultProfileImage} alt="Profile" />
//                   <UserInfo>
//                     <Nickname>{user.nickname}</Nickname>
//                     <Name>{user.name}</Name>
//                   </UserInfo>
//                 </ProfileContainer>
//                 <FollowButton onClick={() => handleFollow(user.nickname)}>팔로우</FollowButton>
//               </RecommendationItem>
//             ))}
//           </RecommendationList>
//           <ShowMoreText visible={!isScrolled}>더 보기</ShowMoreText>
//         </RecommendationsContainer>
//       </RightSection>

//       {isUploadModalOpen && (
//         <Modal
//           isOpen={isUploadModalOpen}
//           showCloseButton={false}
//           onClose={() => setUploadModalOpen(false)}
//           disableOverlayClick={true}
//         >
//           <div>
//             <MakeContent onClose={() => setUploadModalOpen(false)} />
//           </div>
//         </Modal>
//       )}
//       {isLogoutModalOpen && (
//         <Modal
//           isOpen={isLogoutModalOpen}
//           showCloseButton={false}
//           onClose={() => setLogoutModalOpen(false)}
//         >
//           <div style={{ textAlign: 'center' }}>
//             <h3>로그아웃 하시겠습니까?</h3>
//             <div
//               style={{
//                 display: 'flex',
//                 justifyContent: 'center',
//                 gap: '20px',
//                 marginTop: '20px',
//               }}
//             >
//               <Button onClick={() => handleLogout(setLogoutModalOpen)}>
//                 네
//               </Button>
//               <Button onClick={() => setLogoutModalOpen(false)}>
//                 아니오
//               </Button>
//             </div>
//           </div>
//         </Modal>
//       )}
//     </Wrapper>
//   )
// }

// export default Sidebar
