import React from 'react'
import styled from 'styled-components'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

const DownBtnWrapper = styled.div`
  position: fixed;
  bottom: 90px;
  right: 40px;
  background-color: #f8faff;
  border: 2px solid rgba(201, 201, 201, 0.7);
  color: #696969;
  padding: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1000;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
`

const IconButton = styled.div`
  display: flex;
`

const StyledArrowDownwardIcon = styled(ArrowDownwardIcon)`
  width: 1rem;
  height: 1rem;
`

interface DownBtnProps {
  onDownClick: () => void
}

const DownBtn: React.FunctionComponent<DownBtnProps> = ({ onDownClick }) => (
  <DownBtnWrapper onClick={onDownClick}>
    <IconButton id="drowBtn">
      <StyledArrowDownwardIcon />
    </IconButton>
  </DownBtnWrapper>
)

export default DownBtn
