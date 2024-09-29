import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router-dom'
import Routers from './routes'
import '@/styles/tailwind.css'
import Sidebar from './components/Sidebar/sidebar.tsx'
import { ChatProvider } from '@/context/chatContext.tsx'
import { AppProvider } from '@/context/appContext.tsx'
import { WebSocketProvider } from './components/WebSocketProvider/WebSocketProvider.tsx'

const App: React.FC = () => {
  const location = useLocation()
  const noSidebarPaths = [
    '/auth',
    '/login',
    '/register',
    '/find-id',
    '/find-password',
    '/onboarding/location-permission',
    '/onboarding/friend-addition',
    '/onboarding/distance-add',
  ]

  const isNoSidebarPage = noSidebarPaths.includes(location.pathname)
  // const [selectedPage, setSelectedPage] = useState<string>('main')

  return (
    <>
      {!isNoSidebarPage ? (
        <WebSocketProvider>
          <div style={{ display: 'flex', height: '100vh' }}>
            <ChatProvider>
              <Sidebar theme={'light'} />
              <div style={{ flex: 1 }}>
                <Routers />
              </div>
            </ChatProvider>
          </div>
        </WebSocketProvider>
      ) : (
        <div style={{ flex: 1 }}>
          <Routers />
        </div>
      )}
    </>
  )
}

const AppWrapper: React.FC = () => {
  const globalStyle = `
    @font-face {
      font-family: 'Pretendard-Regular';
      src: url('https://fastly.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Regular.woff') format('woff');
      font-weight: 400;
      font-style: normal;
    }

    body {
      font-family: 'Pretendard-Regular', sans-serif;
    }
  `

  React.useEffect(() => {
    const styleSheet = document.createElement('style')
    styleSheet.type = 'text/css'
    styleSheet.innerText = globalStyle
    document.head.appendChild(styleSheet)

    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [])

  return (
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  )
}

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
