import React from 'react'
import ReactDOM from 'react-dom/client'
import Routers from './routes'

const App: React.FC = () => {
  return (
    <>
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
