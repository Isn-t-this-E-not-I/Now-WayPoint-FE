import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import MyPage from '../pages/myPage'
import ProfileEditPage from '../pages/ProfileEditPage'
import MainPage from '../pages/Main/main'
import AuthPage from '@/pages/Auth/AuthPage'
import LoginPage from '@/pages/Auth/LoginPage'
import RegisterPage from '@/pages/Auth/RegisterPage'
import FindIdPage from '@/pages/Auth/FindIdPage'
import FindPasswordPage from '@/pages/Auth/FindPasswordPage'
import UploadContent from '@/pages/MakeContent/makeContent'
import PrivateRoute from '@/components/PrivateRoute/privateRoute'
import UserPage from '@/pages/UserPage'
import EditContent from '@/pages/EditContent/editContent'
import { WebSocketProvider } from '@/components/WebSocketProvider/WebSocketProvider'
import ChattingPage from '@/pages/Chat/chattingPage'
import LocationPermissionPage from '@/pages/Onboarding/LocationPermissionPage'
import FriendAdditionPage from '@/pages/Onboarding/FriendAdditionPage'
import DistanceAddPage from '@/pages/Onboarding/DistanceAddPage'
import OAuth2RedirectHandler from '@/components/loginHandler/OAuth2RedirectHandler'
import { TokenProvider } from '@/components/checkToken/TokenProvider'
import DetailContentWrapper from '@/pages/DetailContent/detailContentWrapper'

const Routers: React.FC = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/find-id" element={<FindIdPage />} />
      <Route path="/find-password" element={<FindPasswordPage />} />
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
      <Route
        path="/onboarding/location-permission"
        element={<LocationPermissionPage />}
      />
      <Route
        path="/onboarding/friend-addition"
        element={<FriendAdditionPage />}
      />
      <Route path="/onboarding/distance-add" element={<DistanceAddPage />} />
      {/* Private routes wrapped with WebSocketProvider */}
      <Route
        element={
          <WebSocketProvider>
            <TokenProvider>
              <PrivateRoute />
            </TokenProvider>
          </WebSocketProvider>
        }
      >
        <Route path="/" element={<Navigate to="/main" />} />
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
        <Route path="/post/:postId" element={<DetailContentWrapper />} />
      </Route>
    </Routes>
  )
}

export default Routers
