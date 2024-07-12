import React from 'react'
import ReactDOM from 'react-dom/client'
import Routers from './routes'
import '@/styles/tailwind.css'
import Theme from '@/components/ThemeController/ThemeContoller'

const App: React.FC = () => {
  return (
    <>
      <Routers />
      <Theme />
    </>
  )
}

const rootElement = document.getElementById('root')
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<App />)
}

export default App
