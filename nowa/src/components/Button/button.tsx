import React from 'react'

interface ButtonProps {
  id: string
  text: string
  onClick: () => void
}

const Button: React.FC<ButtonProps> = ({ id, text, onClick }) => {
  return (
    <div>
      <button id={id} className="btn" onClick={onClick}>
        {text}
      </button>
    </div>
  )
}

export default Button
