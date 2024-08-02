import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Notification } from '@/components/WebSocketProvider/WebSocketProvider';

const NotificationWrapper = styled.div`
  text-align: left;
`;

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
  background-color: wheat;
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
`;

const TimeAgo = styled.span`
  color: #129fe1;
  position: absolute;
  bottom: 0;
  right: 5px;
  font-size: 12px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 15px;
  cursor: pointer;
  color: black;
  position: absolute;
  top: -3px;
  right: 6px;
`;

const NotificationPage2: React.FC = () => {
  const [displayNotifications, setDisplayNotifications] = useState<Notification[]>([]);
  const location = import.meta.env.VITE_APP_API

  useEffect(() => {
    // API 호출
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token'); // 토큰 가져오기
        if (!token) {
          throw new Error('No token found');
        }

        const response = await fetch(`${location}/notify`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: Notification[] = await response.json();
        // notifications를 id 기준으로 역순 정렬
        const sortedNotifications = data.sort((a, b) => b.id - a.id);
        setDisplayNotifications(sortedNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleDelete = (id: number) => {
    setDisplayNotifications(displayNotifications.filter(notification => notification.id !== id));
  };

  console.log('Display notifications:', displayNotifications);

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

export default NotificationPage2;