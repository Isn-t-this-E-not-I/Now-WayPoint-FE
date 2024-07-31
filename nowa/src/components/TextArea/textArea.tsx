import React, { ChangeEvent } from 'react'

interface TextareaProps {
  id: string
  placeholder?: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void
  className?: string
}

const TextArea: React.FC<TextareaProps> = ({
  id,
  placeholder,
  value,
  onChange,
  className = '',
}) => {
  return (
    <div>
      <textarea
        id={id}
        className={`textarea textarea-bordered resize-none ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default TextArea
