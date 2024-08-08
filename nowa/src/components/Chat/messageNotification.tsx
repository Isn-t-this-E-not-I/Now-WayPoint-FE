import React from 'react'
import styled, { keyframes } from 'styled-components'
import { UserInfo } from '../../types/index'

interface MessageNotificationProps {
  msg: string
  user: UserInfo
  onDownClick: () => void
}

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

const MsgNotificationWrapper = styled.div`
  position: absolute;
  bottom: 87px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(
    to top right,
    rgba(174, 116, 188, 0.98),
    rgba(1, 49, 123, 0.98)
  );
  background-size: 200% 200%;
  animation: ${gradientAnimation} 5s ease infinite;
  color: #f8faff;
  border-radius: 4px;
  padding: 10px 20px;
  width: 40rem;
  height: 3rem;
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const NotificationBlockWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const ProfileImage = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
`

const UserName = styled.span`
  font-weight: bold;
`

const Message = styled.span`
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const DownIcon = styled.i`
  font-size: 1.2rem;
`

const MessageNotification: React.FC<MessageNotificationProps> = ({
  msg,
  user,
  onDownClick,
}) => (
  <MsgNotificationWrapper onClick={onDownClick}>
    <NotificationBlockWrapper>
      <ProfileImage
        src={user.profileImageUrl || 'default_profile_image_url'}
        alt="profile image"
      />
      <UserName>{user.userNickname}</UserName>
      <Message>{msg}</Message>
    </NotificationBlockWrapper>
    <DownIcon className="fas fa-angle-down" />
  </MsgNotificationWrapper>
)

export default MessageNotification
