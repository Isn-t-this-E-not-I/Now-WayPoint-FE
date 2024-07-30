import React from 'react'
import { Route, Routes } from 'react-router-dom'

import MyPage from '../pages/myPage'
import IndexPage from '@/pages/index'
import MainPage from '../pages/Main/main'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import FindIdPage from '@/pages/FindIdPage'
import FindPasswordPage from '@/pages/FindPasswordPage'
import DetailContent from '@/pages/DetailContent/detailContent'
import UploadContent from '@/pages/MakeContent/makeContent'
// import PrivateRoute from '@/components/PrivateRoute/privateRoute'

const Routers: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/find-id" element={<FindIdPage />} />
      <Route path="/find-password" element={<FindPasswordPage />} />
      {/* <Route element={<PrivateRoute />}> */}
      <Route path="/" element={<IndexPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/memberfind" element={<></>} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/UploadContent" element={<UploadContent />} />
      <Route path="/detailContent/:id" element={<DetailContent />} />
      <Route path="/contentDetail" element={<></>} />
      <Route path="/contentEdit" element={<></>} />
      <Route path="/profileEdit" element={<></>} />
      <Route path="/chat" element={<></>} />
      <Route path="/notification" element={<></>} />
      {/* </Route> */}
    </Routes>
  )
}

export default Routers
