import React from 'react'

interface SelectOption {
  id: string // 고유한 키 값
  label: string // 옵션의 라벨
}

interface SelectProps {
  options: SelectOption[]
  classN: string
  value: string
  onChange: (value: string) => void
}

const Select: React.FC<SelectProps> = ({
  options,
  classN,
  value,
  onChange,
}) => {
  return (
    <div>
      <select
        className={classN}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Select
