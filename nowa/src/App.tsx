import React from 'react'
import ReactDOM from 'react-dom/client'
import Routers from './routes'
import Custom_Theme from '@/hooks/defaultTheme'
import '@/styles/tailwind.css'

const App: React.FC = () => {
  return (
    <>
      <Custom_Theme />
      <Routers />
    </>
  )
}

const rootElement = document.getElementById('root')
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<App />)
}

export default App
