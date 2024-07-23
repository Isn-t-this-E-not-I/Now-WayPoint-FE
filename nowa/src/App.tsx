import React from 'react'
import ReactDOM from 'react-dom/client'
import Routers from './routes'
import '@/styles/tailwind.css'
import CustomTheme from '@/hooks/defaultTheme'

const App: React.FC = () => {
  return (
    <>
      <Routers />
      <CustomTheme />
    </>
  )
}

const rootElement = document.getElementById('root')
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<App />)
}

export default App
