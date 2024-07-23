import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Main from '@/pages/index'
import DetailContent from '@/pages/DetailContent/detailContent'

const Routers: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/main" element={<Main />} />
          <Route path="/login" element={<></>} />
          <Route path="/register" element={<></>} />
          <Route path="/memberfind" element={<></>} />
          <Route path="/mypage" element={<></>} />
          <Route path="/UploadContent" element={<></>} />
          <Route path="/detailContent" element={<DetailContent />} />
          <Route path="/EditContent" element={<></>} />
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
