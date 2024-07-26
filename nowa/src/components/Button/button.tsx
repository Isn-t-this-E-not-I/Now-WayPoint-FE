import React from 'react'

interface ButtonProps {
  id?: string
  onClick?: () => void
  className?: string
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  id,
  onClick,
  className,
  children,
}) => {
  return (
    <button id={id} onClick={onClick} className={`btn ${className}`}>
      {children}
    </button>
  )
}

export default Button
