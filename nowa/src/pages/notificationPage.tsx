import React, { useState } from 'react'
import styled from 'styled-components'

const NotificationWrapper = styled.div`
  text-align: left;
`

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
  border: 1px solid black;
  padding: 10px;
  border-radius: 5px;
  width: 17.5rem;
  font-size: 15px;
  position: relative;
`

const ProfilePic = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`

const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-right: auto;
  position: relative;
  padding-bottom: 20px; /* Adjusted to prevent overlap */
`

const TimeAgo = styled.span`
  color: #129fe1;
  position: absolute;
  bottom: 0;
  right: 5;
  font-size: 12px;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 15px;
  cursor: pointer;
  position: absolute;
  top: -3px;
  right: 6px;
`

const NotificationPage: React.FC = () => {
  const initialNotifications = [
    {
      id: 1,
      profilePic: 'https://via.placeholder.com/40',
      content: 'You have a new follower!',
      timeAgo: '2 hours ago',
    },
    {
      id: 2,
      profilePic: 'https://via.placeholder.com/40',
      content: 'Your post got 5 likes!',
      timeAgo: '5 hours ago',
    },
    {
      id: 3,
      profilePic: 'https://via.placeholder.com/40',
      content: 'New comment on your post!',
      timeAgo: '1 day ago',
    },
    {
      id: 4,
      profilePic: 'https://via.placeholder.com/40',
      content: 'You have a new message!',
      timeAgo: '3 days ago',
    },
    {
      id: 5,
      profilePic: 'https://via.placeholder.com/40',
      content: 'New friend request!',
      timeAgo: '4 days ago',
    },
    {
      id: 6,
      profilePic: 'https://via.placeholder.com/40',
      content: 'You have a new follower!',
      timeAgo: '5 days ago',
    },
    {
      id: 7,
      profilePic: 'https://via.placeholder.com/40',
      content: 'Your post got 5 likes!',
      timeAgo: '6 days ago',
    },
    {
      id: 8,
      profilePic: 'https://via.placeholder.com/40',
      content: 'New comment on your post!',
      timeAgo: '1 week ago',
    },
    {
      id: 9,
      profilePic: 'https://via.placeholder.com/40',
      content: 'You have a new message!',
      timeAgo: '2 weeks ago',
    },
    {
      id: 10,
      profilePic: 'https://via.placeholder.com/40',
      content: 'Your post got 10 likes!',
      timeAgo: '3 weeks ago',
    },
  ]

  const [notifications, setNotifications] = useState(initialNotifications)

  const handleDelete = (id: number) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    )
  }

  return (
    <>
      <NotificationWrapper>
        {notifications.map((notification) => (
          <NotificationItem key={notification.id}>
            <ProfilePic src={notification.profilePic} alt="Profile" />
            <NotificationContent>
              <span>{notification.content}</span>
              <TimeAgo>{notification.timeAgo}</TimeAgo>
            </NotificationContent>
            <CloseButton onClick={() => handleDelete(notification.id)}>
              x
            </CloseButton>
          </NotificationItem>
        ))}
      </NotificationWrapper>
    </>
  )
}

export default NotificationPage
