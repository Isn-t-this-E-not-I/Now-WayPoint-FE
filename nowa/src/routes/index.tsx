import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import MyPage from '../pages/myPage'
import ProfileEditPage from '../pages/ProfileEditPage'
import IndexPage from '@/pages/index'
import MainPage from '../pages/Main/main'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import FindIdPage from '@/pages/FindIdPage'
import FindPasswordPage from '@/pages/FindPasswordPage'
import DetailContent from '@/pages/DetailContent/DetailContent'
import UploadContent from '@/pages/MakeContent/makeContent'
import PrivateRoute from '@/components/PrivateRoute/privateRoute'
import UserPage from '@/pages/UserPage'
import EditContent from '@/pages/EditContent/editContent'
import { WebSocketProvider } from '@/components/WebSocketProvider/WebSocketProvider'

const Routers: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/find-id" element={<FindIdPage />} />
      <Route path="/find-password" element={<FindPasswordPage />} />

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
        <Route path="/UploadContent" element={<UploadContent />} />
        <Route path="/detailContent/:id" element={<DetailContent />} />
        <Route path="/editContent/:id" element={<EditContent />} />
        <Route path="/profileEdit" element={<></>} />
        <Route path="/chat" element={<></>} />
        <Route path="/notification" element={<></>} />
        <Route path="/user/:nickname" element={<UserPage />} />
      </Route>
    </Routes>
  )
}

export default Routers
