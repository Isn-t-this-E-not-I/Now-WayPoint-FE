import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import Routers from './routes'
import '@/styles/tailwind.css'
import Custom_Theme from '@/hooks/defaultTheme'
import Sidebar from './components/Sidebar/sidebar.tsx'
import MainPage from '../src/pages'
import CreatePage from '../src/pages'
import MyPage from '../src/pages'
import ChattingPage from '../src/pages/chattingPage.tsx'

const App: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState<string>('main')
  const [selectedChatRoom, setSelectedChatRoom] = useState<null | {
    id: number
    profilePic: string
    name: string
    lastMessage: string
  }>(null)

  const handleChatItemClick = (chatRoom: {
    id: number
    profilePic: string
    name: string
    lastMessage: string
  }) => {
    setSelectedChatRoom(chatRoom)
    setSelectedPage('chatting')
  }

  const renderContent = () => {
    switch (selectedPage) {
      case 'main':
        return <MainPage />
      case 'create':
        return <CreatePage />
      case 'myPage':
        return <MyPage />
      case 'chatting':
        return selectedChatRoom ? (
          <ChattingPage chatRoom={selectedChatRoom} />
        ) : null
      default:
        return null
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        theme={'light'}
        onChatItemClick={handleChatItemClick}
        setSelectedPage={setSelectedPage}
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
