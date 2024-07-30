import React from 'react'
import { Route, Routes } from 'react-router-dom'
import IndexPage from '@/pages/index'
import MainPage from '@/api/KaKaomap/kakaomain' // 수정된 MainPage 경로
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import FindIdPage from '@/pages/FindIdPage'
import FindPasswordPage from '@/pages/FindPasswordPage'
import DetailContent from '@/pages/DetailContent/detailContent'
import UploadContent from '@/pages/MakeContent/makeContent'
// import ResetPasswordPage from '@/pages/ResetPasswordPage';

const Routers: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/find-id" element={<FindIdPage />} />
      <Route path="/find-password" element={<FindPasswordPage />} />
      {/* <Route path="/reset-password" element={<ResetPasswordPage />} /> */}
      <Route path="/memberfind" element={<></>} />
      <Route path="/mypage" element={<></>} />
      <Route path="/makeContent" element={<UploadContent />} />
      <Route path="/detailContent/:id" element={<DetailContent />} />
      <Route path="/contentEdit" element={<></>} />
      <Route path="/profileEdit" element={<></>} />
      <Route path="/chat" element={<></>} />
      <Route path="/notification" element={<></>} />
      <Route path="/test1" element={<></>} />
    </Routes>
  )
}

export default Routers
