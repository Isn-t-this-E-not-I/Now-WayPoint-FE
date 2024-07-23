import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import Routers from './routes'
import '@/styles/tailwind.css'
import Custom_Theme from '@/hooks/defaultTheme'
import Sidebar from './components/Sidebar/sidebar.tsx'
import MainPage from '@/pages/Main/main.tsx'
import CreatePage from '../src/pages'
import MyPage from '../src/pages'
import ChatApp from './pages/Chat/chatApp.tsx'
import LoginPage from './pages/LoginPage.tsx'

const App: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState<string>('main')

  const renderContent = () => {
    switch (selectedPage) {
      case 'main':
        return <MainPage />
      case 'create':
        return <CreatePage />
      case 'myPage':
        return <MyPage />
      case 'chatting':
        return <ChatApp />
      default:
        return null
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        theme={'light'}
        setSelectedPage={setSelectedPage}
        chatRooms={[]}
        onChatItemClick={() => {}}
        onExitChatRoom={() => {}}
        setChatRooms={() => {}}
        onCreateChat={() => {}}
        token={''}
      />
      <div style={{ flex: 1 }}>{renderContent()}</div>
      <Custom_Theme />
      <Routers />
    </div>
  )
}

const rootElement = document.getElementById('root')
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<App />)
}

export default App
