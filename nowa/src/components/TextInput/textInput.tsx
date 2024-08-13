import React, { ChangeEvent, CSSProperties } from 'react'

interface TextInputProps {
  type: string;
  placeholder: string;
  name?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: string | number;
  className?: string;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  style?: CSSProperties; // 인라인 스타일을 추가할 수 있도록 CSSProperties 타입 추가
}

const TextInput: React.FC<TextInputProps> = ({ type, placeholder, name, onChange, value, className, onKeyDown, style }) => {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        onChange={onChange}
        value={value}
        onKeyDown={onKeyDown}
        className={`input input-bordered w-full ${className}`}
        style={style} // 인라인 스타일 적용
      />
    </div>
  )
}

export default TextInput;
