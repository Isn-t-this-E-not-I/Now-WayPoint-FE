import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<></>} />
          <Route path="/login" element={<></>} />
          <Route path="/register" element={<></>} />
          <Route path="/find" element={<></>} />
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

const rootElement = document.getElementById('root')
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<App />)
}

export default App
