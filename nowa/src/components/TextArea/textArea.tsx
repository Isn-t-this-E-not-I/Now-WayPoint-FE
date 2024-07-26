import React from 'react'

interface TextareaProps {
  id: string
  text: string
  value: string
  onChange: (value: string) => void
}

const Textarea: React.FC<TextareaProps> = ({ id, text, value, onChange }) => {
  return (
    <div>
      <textarea
        id={id}
        className="textarea textarea-bordered resize-none"
        placeholder={text}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export default Textarea
