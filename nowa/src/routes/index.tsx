import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import MyPage from '../pages/myPage'
import ProfileEditPage from '../pages/ProfileEditPage'
import MainPage from '../pages/Main/main'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import FindIdPage from '@/pages/FindIdPage'
import FindPasswordPage from '@/pages/FindPasswordPage'
import UploadContent from '@/pages/MakeContent/makeContent'
import PrivateRoute from '@/components/PrivateRoute/privateRoute'
import UserPage from '@/pages/UserPage'
import EditContent from '@/pages/EditContent/editContent'
import { WebSocketProvider } from '@/components/WebSocketProvider/WebSocketProvider'
import ChattingPage from '@/pages/Chat/chattingPage'
import LocationPermissionPage from '@/pages/Onboarding/LocationPermissionPage';
import FriendAdditionPage from '@/pages/Onboarding/FriendAdditionPage';
import SiteGuidePage from '@/pages/Onboarding/SiteGuidePage';
import OAuth2RedirectHandler from '@/components/loginHandler/OAuth2RedirectHandler'

const Routers: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/find-id" element={<FindIdPage />} />
      <Route path="/find-password" element={<FindPasswordPage />} />
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
      <Route path="/onboarding/location-permission" element={<LocationPermissionPage />} />
      <Route path="/onboarding/friend-addition" element={<FriendAdditionPage />} />
      <Route path="/onboarding/site-guide" element={<SiteGuidePage />} />
      {/* Private routes wrapped with WebSocketProvider */}
      <Route
        element={
          <WebSocketProvider>
            <PrivateRoute />
          </WebSocketProvider>
        }
      >
        <Route path="/" element={<Navigate to="/main" />} />{' '}
        <Route path="/main" element={<MainPage />} />
        <Route path="/memberfind" element={<></>} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/profileEdit" element={<ProfileEditPage />} />
        <Route
          path="/UploadContent"
          element={
            <UploadContent
              onClose={function (): void {
                throw new Error('에러가 발생했습니다')
              }}
            />
          }
        />
        {/* <Route path="/detailContent/:id" element={<DetailContent />} /> */}
        <Route
          path="/editContent/:id"
          element={
            <EditContent
              onClose={function (): void {
                throw new Error('에러가 발생했습니다')
              }}
              refreshPost={function (): void {
                throw new Error('게시글 수정에 실패하셨습니다')
              }}
            />
          }
        />
        <Route path="/profileEdit" element={<></>} />
        <Route path="/chat" element={<></>} />
        <Route path="/chatting/:chatRoomId" element={<ChattingPage />} />
        <Route path="/notification" element={<></>} />
        <Route path="/user/:nickname" element={<UserPage />} />
      </Route>
    </Routes>
  )
}

export default Routers
