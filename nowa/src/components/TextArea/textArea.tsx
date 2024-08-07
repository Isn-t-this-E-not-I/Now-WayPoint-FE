import React, { ChangeEvent, KeyboardEvent, FocusEvent } from 'react'

interface TextareaProps {
  id: string
  placeholder?: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void;
  className?: string
}

const TextArea: React.FC<TextareaProps> = ({
  id,
  placeholder,
  value,
  onChange,
  onKeyDown,
  onBlur,
  className = '',
}) => {
  return (
    <textarea
      id={id}
      className={`textarea textarea-bordered resize-none ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
    />
  )
}

export default TextArea
