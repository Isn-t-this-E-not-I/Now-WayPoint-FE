import React from 'react'

interface ButtonProps {
  id: string
  text: string
}

const button: React.FC<ButtonProps> = ({ id, text }) => {
  return (
    <div>
      <button id={id} className="btn">
        {text}
      </button>
    </div>
  )
}

export default button
