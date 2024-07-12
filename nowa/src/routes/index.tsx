import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Main from '@/pages/index'
import MainTest from '@/pages/Main/main'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'

const Routers: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/maintest" element={<MainTest />} />
          <Route path="/main" element={<Main />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/memberfind" element={<></>} />
          <Route path="/mypage" element={<></>} />
          <Route path="/contentUpload" element={<></>} />
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
