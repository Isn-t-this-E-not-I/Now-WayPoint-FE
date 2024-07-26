import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Main from '@/pages/index'
import MakeContent from '@/pages/MakeContent/makeContent'
// import ResetPasswordPage from '@/pages/ResetPasswordPage';

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
