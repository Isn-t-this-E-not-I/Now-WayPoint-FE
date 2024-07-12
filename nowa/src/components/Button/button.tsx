import React from 'react'

interface ButtonProps {
  id: string
}

const button: React.FC<ButtonProps> = ({ id }) => {
  return (
    <div>
      <button id={id} className="btn">
        Button
      </button>
    </div>
  )
}

export default button
