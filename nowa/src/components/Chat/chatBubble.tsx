import React from 'react'
import styled from 'styled-components'

interface ChatBubbleProps {
  alignment: 'start' | 'end'
  avatarSrc?: string
  header: string
  time: string
  message: string
  footer: string
  onAvatarClick?: () => void
}

const BubbleWrapper = styled.div<{ alignment: 'start' | 'end' }>`
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  flex-direction: ${({ alignment }) =>
    alignment === 'start' ? 'row' : 'row-reverse'};
`

const Avatar = styled.div<{ alignment: 'start' | 'end' }>`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  margin-right: ${({ alignment }) => (alignment === 'start' ? '10px' : '0')};
  margin-left: ${({ alignment }) => (alignment === 'end' ? '10px' : '0')};
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const Content = styled.div`
  max-width: 70%;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
`

// const Time = styled.time`
//   font-size: 12px;
//   color: #666;
//   margin-left: 5px;
// `

const Bubble = styled.div<{ alignment: 'start' | 'end' }>`
  background-color: ${({ alignment }) =>
    alignment === 'start' ? '#01317b' : '#ae74bc'};
  color: ${({ alignment }) => (alignment === 'start' ? '#fff' : '#fff')};
  border-radius: 15px;
  padding: 10px;
  position: relative;
  margin-top: 5px;
  word-wrap: break-word;
  white-space: pre-wrap;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    ${({ alignment }) =>
      alignment === 'start' ? 'left: -7px' : 'right: -7px'};
    border-width: 10px;
    border-style: solid;
    border-color: ${({ alignment }) =>
      alignment === 'start'
        ? '#01317b transparent transparent transparent'
        : '#ae74bc transparent transparent transparent'};
    transform: ${({ alignment }) =>
      alignment === 'start' ? 'rotate(-45deg)' : 'rotate(45deg)'};
  }
`

const Footer = styled.div<{ alignment: 'start' | 'end' }>`
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  text-align: ${({ alignment }) => (alignment === 'start' ? 'left' : 'right')};
`

const ChatBubble: React.FC<ChatBubbleProps> = ({
  alignment,
  avatarSrc,
  header,
  message,
  footer,
  onAvatarClick,
}) => {
  return (
    <BubbleWrapper alignment={alignment}>
      {avatarSrc && (
        <Avatar alignment={alignment} onClick={onAvatarClick}>
          <img alt="Avatar" src={avatarSrc} />
        </Avatar>
      )}
      <Content>
        <Header>{header}</Header>
        <Bubble alignment={alignment}>{message}</Bubble>
        <Footer alignment={alignment}>{footer}</Footer>
      </Content>
    </BubbleWrapper>
  )
}

export default ChatBubble
