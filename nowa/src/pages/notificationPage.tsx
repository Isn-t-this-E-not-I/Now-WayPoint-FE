import React, { useEffect, useState } from 'react';
import { useWebSocket, Notification } from '@/components/WebSocketProvider/WebSocketProvider';
import styled from 'styled-components';

const NotificationWrapper = styled.div`
  text-align: left;
  max-height: 90vh;
  padding : 10px;
  width: 100%;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
  box-shadow: 5px 4px 0px 0px rgba(57, 55, 55, 0.3);
  padding: 10px;
  border-radius: 12px;
  height: 4.5rem;
  width: 17.5rem;
  font-size: 15px;
  background-color: rgba(195, 188, 188, 0.5); /* 검은색 배경을 50% 투명하게 설정 */
  position: relative;
`;

const ProfilePic = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-right: auto;
  position: relative;
  padding-bottom: 20px;
  font-size : 14px;
`;

const TimeAgo = styled.span`
  color: #129fe1;
  position: absolute;
  bottom: 0;
  right: 5px;
  font-size: 11px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 15px;
  cursor: pointer;
  color: red;
  position: absolute;
  top: -3px;
  right: 6px;
`;

const NotificationPage: React.FC = () => {
  const { notifications, isLoading } = useWebSocket();
  const [displayNotifications, setDisplayNotifications] = useState<Notification[]>([]);
  const location = import.meta.env.VITE_APP_API

  useEffect(() => {
    if (!isLoading) {
      // notifications를 id 기준으로 역순 정렬
      setDisplayNotifications(notifications);
      console.log(notifications)
    }
  }, [notifications, isLoading]);

  const handleDelete = (id: number) => {
    // 로컬 상태에서 해당 알림을 제거
    setDisplayNotifications(displayNotifications.filter(notification => notification.id !== id));
  
    // 알림 삭제를 위한 API 호출
    const deleteNotification = async () => {
      try {
        const token = localStorage.getItem('token'); // 토큰 가져오기
        if (!token) {
          throw new Error('No token found');
        }
  
        const response = await fetch(`${location}/notify`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id : id }) // 삭제할 알림의 ID를 body에 포함
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    };
  
    deleteNotification();
  };

  return (
    <NotificationWrapper>
      {displayNotifications.map((notification) => (
        <NotificationItem key={notification.id}>
          <ProfilePic src={notification.profileImageUrl} alt="Profile" />
          <NotificationContent>
            <span>{notification.message}</span>
            <TimeAgo>{notification.createDate}</TimeAgo>
          </NotificationContent>
          <CloseButton onClick={() => handleDelete(notification.id)}>x</CloseButton>
        </NotificationItem>
      ))}
    </NotificationWrapper>
  );
};

export default NotificationPage;