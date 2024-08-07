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
  width: 17rem;
  font-size: 15px;
  border: 2.3px solid transparent;
  background:
    linear-gradient(to right, #f8faff, #f8faff) padding-box,
    linear-gradient(to top left, #ae74bc, #01317b) border-box;
  cursor: pointer;
  position: relative; 
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
  font-size: 14px;
  color: #151515;
  width: 18rem;
`

const TimeAgo = styled.span`
  position: absolute;
  bottom: 5px; 
  right: 10px; 
  color: #4888e7;
  font-size: 11px;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 15px;
  cursor: pointer;
  color: #000947;
`

const ContentText = styled.div`
  font-size: 14px;
`

const ContentPic = styled.img`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 45px;
  height: 45px;
  border-radius: 10px;
  border: solid 1px #e8e4e4;
  margin-right: 5px;
  margin-left: 5px;
  cursor: pointer;
`

const NotificationPage: React.FC = () => {
  const { notifications, isLoading, resetNotifyCount, deleteSocketNotification } = useWebSocket()
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
      handleDelete(notification.id);
    } else {
      navigate(`/user/${notification.nickname}?tab=posts`)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedPostId(null)
  }

  useEffect(() => {
    resetNotifyCount();
  }, [resetNotifyCount]);

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

    //notifications에 데이터 제거
    deleteSocketNotification(id);

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
            e.stopPropagation(); // 이벤트 버블링 중지
            handleProfileClick(notification.nickname);
          }}
        />
        <NotificationContent>
          <ContentDisplay content={notification.message} comment={notification.comment} />
        </NotificationContent>
        {notification.mediaUrl && <ContentPic src={notification.mediaUrl} />}
        <TimeAgo>{formatRelativeTime(notification.createDate)}</TimeAgo>
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

const ContentDisplay: React.FC<{ content: string, comment?: string }> = ({ content, comment }) => {
  const limit = 33; // 표시할 최대 글자 수

  const sumContent = comment ? `${content} : ${comment}` : content;

  // 콘텐츠 길이가 limit을 초과하면 잘라내고 '...' 추가
  const truncatedContent = sumContent.length > limit ? `${content.substring(0, limit)}...` : content;

  return <ContentText>{truncatedContent}</ContentText>;
};

export default NotificationPage
