import React, { useState, useEffect } from 'react'

const defaultTheme: React.FC = () => {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return <></>
}

export default defaultTheme
