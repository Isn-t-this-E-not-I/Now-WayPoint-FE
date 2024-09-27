import React, { useState, useEffect } from 'react'

const defaultTheme: React.FC = () => {
  const [theme] = useState('light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return <div></div>
}

export default defaultTheme
