import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router-dom'
import Routers from './routes'
import '@/styles/tailwind.css'
import Sidebar from './components/Sidebar/sidebar.tsx'
import { ChatProvider } from '@/context/chatContext.tsx'
import { AppProvider } from '@/context/appContext.tsx'

const App: React.FC = () => {
  const location = useLocation()
  const noSidebarPaths = ['/login', '/register', '/find-id', '/find-password'] // Sidebar가 보이지 않아야 하는 경로

  const isNoSidebarPage = noSidebarPaths.includes(location.pathname)
  const [selectedPage, setSelectedPage] = useState<string>('main')

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <ChatProvider>
        {!isNoSidebarPage && (
          <Sidebar
            theme={'light'}
            setSelectedPage={setSelectedPage}
          />
        )}
        <div style={{ flex: 1 }}>
          <Routers />
        </div>
      </ChatProvider>
    </div >
  )
}

const AppWrapper: React.FC = () => (
  <BrowserRouter>
    <AppProvider>
      <App />
    </AppProvider>
  </BrowserRouter>
)

const rootElement = document.getElementById('root')
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <AppWrapper />
    </React.StrictMode>
  )
}

export default App
