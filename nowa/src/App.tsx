import React from 'react'
import ReactDOM from 'react-dom/client'
import Routers from './routes'
import '@/styles/tailwind.css'
import Theme from '@/components/ThemeController/ThemeContoller'
import Button from './components/Button/button'
import TextArea from './components/TextArea/textArea'
import IconLogin from '@/components/IconLogin/iconLogin'
import Search from './components/Search/search'
import TextInput from './components/TextInput/TextInput'
import FileInput from './components/FileInput/fileInput'
import Tap from './components/Tap/tap'
import Custom_Theme from '@/hooks/defaultTheme'

const App: React.FC = () => {
  return (
    <>
      {/* <Custom_Theme /> */}
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
