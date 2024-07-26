import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router-dom'
import Routers from './routes'
import '@/styles/tailwind.css'
import Custom_Theme from '@/hooks/defaultTheme'
import Sidebar from './components/Sidebar/sidebar.tsx'
import MainPage from '@/pages/Main/main.tsx'
import CreatePage from '@/pages/createPage.tsx'
import MyPage from '@/pages/myPage.tsx'

const App: React.FC = () => {
  const location = useLocation()
  const noSidebarPaths = ['/login', '/register', '/find-id', '/find-password'] // Sidebar가 보이지 않아야 하는 경로

  const isNoSidebarPage = noSidebarPaths.includes(location.pathname)
  const [selectedPage, setSelectedPage] = useState<string>('main')

  const renderContent = () => {
    switch (selectedPage) {
      case 'main':
        return <MainPage />
      case 'create':
        return <CreatePage />
      case 'myPage':
        return <MyPage />
      // case 'chatting':
      //   return <ChattingPage chatRoomId={123} token={''} /> // 필요에 따라 chatRoomId와 token을 업데이트하세요.
      default:
        return null
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {!isNoSidebarPage && (
        <Sidebar
          theme={'light'}
          setSelectedPage={setSelectedPage}
          chatRooms={[]}
          onChatItemClick={() => {}}
          setChatRooms={() => {}}
          onCreateChat={() => {}}
          token={''}
          userNickname={''}
          onExitChatRoom={function (id: number): void {
            throw new Error('Function not implemented.')
          }}
        /> // userNickname 추가
      )}
      <div style={{ flex: 1 }}>
        {isNoSidebarPage ? <Routers /> : renderContent()}
      </div>
      <Custom_Theme />
    </div>
  )
}

const AppWrapper: React.FC = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

const rootElement = document.getElementById('root')
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<AppWrapper />)
}

export default App
