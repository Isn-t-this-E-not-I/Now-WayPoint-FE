import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import Routers from './routes'
import '@/styles/tailwind.css'
import Custom_Theme from '@/hooks/defaultTheme'
import Sidebar from './components/Sidebar/sidebar.tsx'
import MainPage from '../src/pages'
import CreatePage from '../src/pages'
import MyPage from '../src/pages'
import ChattingPage from './pages/Chat/chattingPage.tsx'

const App: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState<string>('main')
  const [chatRooms, setChatRooms] = useState([
    {
      id: 1,
      profilePic: 'https://via.placeholder.com/40',
      name: 'Chat Room 1',
      lastMessage: 'Last message in chat room 1',
    },
    {
      id: 2,
      profilePic: 'https://via.placeholder.com/40',
      name: 'Chat Room 2',
      lastMessage: 'Last message in chat room 2',
    },
  ])
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

  const handleChatRoomNameChange = (id: number, newName: string) => {
    const updatedChatRooms = chatRooms.map((chatRoom) =>
      chatRoom.id === id ? { ...chatRoom, name: newName } : chatRoom
    )
    setChatRooms(updatedChatRooms)
    if (selectedChatRoom && selectedChatRoom.id === id) {
      setSelectedChatRoom({ ...selectedChatRoom, name: newName })
    }
  }

  const handleCreateChat = (newChatRoom: {
    id: number
    profilePic: string
    name: string
    lastMessage: string
  }) => {
    setChatRooms([...chatRooms, newChatRoom])
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
          <ChattingPage
            chatRoom={selectedChatRoom}
            onChatRoomNameChange={handleChatRoomNameChange}
          />
        ) : null
      default:
        return null
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        theme={'light'}
        chatRooms={chatRooms}
        onChatItemClick={handleChatItemClick}
        setSelectedPage={setSelectedPage}
        onExitChatRoom={(id: number) =>
          setChatRooms(chatRooms.filter((chatRoom) => chatRoom.id !== id))
        }
        onCreateChat={handleCreateChat}
        setChatRooms={setChatRooms}
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
