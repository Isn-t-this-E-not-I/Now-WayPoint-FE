import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #fff;
`

const MyPage: React.FC = () => {
  return (
    <Wrapper>
      <h1>확인용 임시 My Page</h1>
    </Wrapper>
  )
}

export default MyPage
