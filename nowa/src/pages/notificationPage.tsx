import React, { useEffect, useState } from 'react'
import {
  useWebSocket,
  Notification,
} from '@/components/WebSocketProvider/WebSocketProvider'
import styled from 'styled-components'

const NotificationWrapper = styled.div`
  max-height: 90vh;
  padding: 10px;
  width: 100%;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
`

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 12px;
  height: 5.5rem;
  width: 17.5rem;
  font-size: 15px;
  border: 1px solid #ddd;
  &:hover {
    border: 1px solid black;
  }
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
  padding-bottom: 20px;
  font-size: 14px;
`

const TimeAgo = styled.span`
  color: #129fe1;
  font-size: 11px;
  margin-left: auto;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 15px;
  cursor: pointer;
  color: red;
`

const NotificationPage: React.FC = () => {
  const { notifications, isLoading } = useWebSocket()
  const [displayNotifications, setDisplayNotifications] = useState<
    Notification[]
  >([])
  const location = import.meta.env.VITE_APP_API

  useEffect(() => {
    if (!isLoading) {
      // notifications를 id 기준으로 역순 정렬
      setDisplayNotifications(notifications)
      console.log(notifications)
    }
  }, [notifications, isLoading])

  const handleDelete = (id: number) => {
    // 로컬 상태에서 해당 알림을 제거
    setDisplayNotifications(
      displayNotifications.filter((notification) => notification.id !== id)
    )

    // 알림 삭제를 위한 API 호출
    const deleteNotification = async () => {
      try {
        const token = localStorage.getItem('token') // 토큰 가져오기
        if (!token) {
          throw new Error('No token found')
        }

        const response = await fetch(`${location}/notify`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: id }), // 삭제할 알림의 ID를 body에 포함
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
      } catch (error) {
        console.error('Failed to delete notification:', error)
      }
    }

    deleteNotification()
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date().getTime()
    const time = new Date(timestamp).getTime()
    const diff = now - time

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) {
      return `${days}일 전`
    } else if (hours > 0) {
      return `${hours}시간 전`
    } else if (minutes > 0) {
      return `${minutes}분 전`
    } else {
      return '방금 전'
    }
  }

  return (
    <NotificationWrapper>
      {displayNotifications.map((notification) => (
        <NotificationItem key={notification.id}>
          <ProfilePic src={notification.profileImageUrl} alt="Profile" />
          <NotificationContent>
            <span>{notification.message}</span>
            <TimeAgo>{formatRelativeTime(notification.createDate)}</TimeAgo>
          </NotificationContent>
          <CloseButton onClick={() => handleDelete(notification.id)}>
            x
          </CloseButton>
        </NotificationItem>
      ))}
    </NotificationWrapper>
  )
}

export default NotificationPage
