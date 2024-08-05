import React, { useEffect, useState } from 'react'
import {
  useWebSocket,
  Notification,
} from '@/components/WebSocketProvider/WebSocketProvider'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import DetailContentModal from '@/components/Modal/ContentModal'

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
  margin-left: 10px;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 12px;
  height: 5.5rem;
  width: 18rem;
  font-size: 15px;
  border: 2.3px solid transparent;
  background:
    linear-gradient(to right, #f8faff, #f8faff) padding-box,
    linear-gradient(to top left, #ae74bc, #01317b) border-box;
  cursor: pointer;

  &:hover {
    border: 1px solid black;
  }
`

const ProfilePic = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  cursor: pointer;
`

const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-right: auto;
  padding-bottom: 20px;
  font-size: 14px;
  color: #151515;
  width: 18rem;
`

const TimeAgo = styled.span`
  color: #01317b;
  font-size: 11px;
  margin-left: auto;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 15px;
  cursor: pointer;
  color: #000947;
`

const NotificationPage: React.FC = () => {
  const { notifications, isLoading } = useWebSocket()
  const [displayNotifications, setDisplayNotifications] = useState<
    Notification[]
  >([])
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const location = import.meta.env.VITE_APP_API
  const navigate = useNavigate()

  const handleProfileClick = (nickname: string) => {
    navigate(`/user/${nickname}?tab=posts`)
  }

  const handleContentClick = (notification: Notification) => {
    if (notification.postId) {
      setSelectedPostId(notification.postId)
      setModalOpen(true)
    } else {
      navigate(`/user/${notification.nickname}?tab=posts`)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedPostId(null)
  }

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
        <NotificationItem
          key={notification.id}
          onClick={() => handleContentClick(notification)}
        >
          <ProfilePic
            src={notification.profileImageUrl}
            alt="Profile"
            onClick={(e) => {
              e.stopPropagation() // 이벤트 버블링 중지
              handleProfileClick(notification.nickname)
            }}
          />
          <NotificationContent>
            <span>{notification.message}</span>
            <TimeAgo>{formatRelativeTime(notification.createDate)}</TimeAgo>
          </NotificationContent>
          <CloseButton
            onClick={(e) => {
              e.stopPropagation() // 이벤트 버블링 중지
              handleDelete(notification.id)
            }}
          >
            x
          </CloseButton>
        </NotificationItem>
      ))}
      {selectedPostId !== null && (
        <DetailContentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          postId={selectedPostId}
          showCloseButton={true}
        />
      )}
    </NotificationWrapper>
  )
}

export default NotificationPage
