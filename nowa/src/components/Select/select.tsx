import React, { useState } from 'react'
import styled from 'styled-components'

interface SelectOption {
  id?: string // 고유한 키 값
  label?: string // 옵션의 라벨
}

interface SelectProps {
  options: SelectOption[]
  classN?: string
  value: string
  onChange: (value: string) => void
}

const SelectContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 200px;
  font-family: Arial, sans-serif;
`

const SelectButton = styled.div<{ isOpen: boolean }>`
  background-color: #fff;
  border: 1px solid ${({ isOpen }) => (isOpen ? 'gray' : '#ccc')};
  padding: 10px;
  cursor: pointer;
  width: 90px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
  transition: border-color 0.3s ease;
  font-size: 12px;
  &:hover {
    border: 1px solid black;
  }
`

// box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);

const SelectDropdown = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  position: absolute;
  background-color: white;
  min-width: 90px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 10;
  border-radius: 10px;
  margin-top: 5px;
  font-size: 12px;
`

const SelectDropdownOption = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  &:hover {
    background-color: #ddd;
  }
`

const Arrow = styled.span`
  margin-left: 10px;
`

const Select: React.FC<SelectProps> = ({
  options,
  classN,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleOptionClick = (id: string) => {
    onChange(id)
    setIsOpen(false)
  }

  return (
    <SelectContainer className={classN}>
      <SelectButton isOpen={isOpen} onClick={handleToggle}>
        {options.find((option) => option.id === value)?.label}
        <Arrow>{isOpen ? '▲' : '▼'}</Arrow>
      </SelectButton>
      <SelectDropdown isOpen={isOpen}>
        {options.map((option) => (
          <SelectDropdownOption
            key={option.id}
            onClick={() => handleOptionClick(option.id!)}
          >
            {option.label}
          </SelectDropdownOption>
        ))}
      </SelectDropdown>
    </SelectContainer>
  )
}

export default Select
