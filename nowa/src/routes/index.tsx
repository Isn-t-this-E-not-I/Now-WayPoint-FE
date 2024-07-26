import React from 'react'
<<<<<<< Updated upstream
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Main from '@/pages/index'
import MakeContent from '@/pages/MakeContent/makeContent'
=======
import { Route, Routes } from 'react-router-dom'
import IndexPage from '@/pages/index'
import MainPage from '@/api/KaKaomap/kakaomain' // 수정된 MainPage 경로
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import FindIdPage from '@/pages/FindIdPage'
import FindPasswordPage from '@/pages/FindPasswordPage'
import DetailContent from '@/pages/DetailContent/DetailContent'
// import ResetPasswordPage from '@/pages/ResetPasswordPage';
>>>>>>> Stashed changes

const Routers: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<></>} />
          <Route path="/register" element={<></>} />
          <Route path="/memberfind" element={<></>} />
          <Route path="/mypage" element={<></>} />
          <Route path="/makeContent" element={<MakeContent />} />
          <Route path="/contentDetail" element={<></>} />
          <Route path="/contentEdit" element={<></>} />
          <Route path="/profileEdit" element={<></>} />
          <Route path="/chat" element={<></>} />
          <Route path="/notification" element={<></>} />
          <Route path="/test1" element={<></>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default Routers
