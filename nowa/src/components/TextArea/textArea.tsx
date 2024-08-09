import React, { ChangeEvent, KeyboardEvent, FocusEvent } from 'react'
import { styled } from 'styled-components'

interface TextareaProps {
  id: string
  placeholder?: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void
  className?: string
}

const TextAreaWrapper = styled.div`
  position: relative;
  width: 100%;
`

const TextAreaStyled = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: none;
`

const CharCount = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 12px;
  color: #999;
`

const TextArea: React.FC<TextareaProps> = ({
  id,
  placeholder,
  value,
  onChange,
  onKeyDown,
  onBlur,
  className = '',
}) => {
  const displayValue = value ?? ''
  return (
    <TextAreaWrapper>
      <TextAreaStyled
        id={id}
        className={`textarea textarea-bordered resize-none ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
      />
      {displayValue !== undefined && (
        <CharCount>{displayValue.length} / 150</CharCount>
      )}
    </TextAreaWrapper>
  )
}

export default TextArea
