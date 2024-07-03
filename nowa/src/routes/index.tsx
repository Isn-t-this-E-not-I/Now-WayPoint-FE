import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'

const App: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<></>} />
          <Route path="/login" element={<></>} />
          <Route path="/register" element={<></>} />
          <Route path="/memberfind" element={<></>} />
          <Route path="/mypage" element={<></>} />
          <Route path="/contentUpload" element={<></>} />
          <Route path="/contentDetail" element={<></>} />
          <Route path="/contentEdit" element={<></>} />
          <Route path="/profileEdit" element={<></>} />
          <Route path="/chat" element={<></>} />
          <Route path="/notification" element={<></>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
