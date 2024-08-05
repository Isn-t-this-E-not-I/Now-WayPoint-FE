import React, { ChangeEvent, KeyboardEvent } from 'react'

interface TextareaProps {
  id: string
  placeholder?: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void // onKeyDown 추가
  className?: string
}

const TextArea: React.FC<TextareaProps> = ({
  id,
  placeholder,
  value,
  onChange,
  onKeyDown, // onKeyDown 추가
  className = '',
}) => {
  return (
    <textarea
      id={id}
      className={`textarea textarea-bordered resize-none ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown} // onKeyDown 추가
    />
  )
}

export default TextArea
