import React, { useEffect, useRef, createContext, useContext, ReactNode, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

// Define Notification type
export interface Notification {
  id: number;
  nickname: string;
  profileImageUrl: string;
  message: string;
  createDate: string;
}

interface WebSocketContextProps {
  client: Client | null;
  notifications: Notification[];
  isLoading: boolean;
  getStompClient: () => Client | null;
}

const WebSocketContext = createContext<WebSocketContextProps>({
  client: null,
  notifications: [],
  isLoading: true,
  getStompClient: () => null
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const clientRef = useRef<Client | null>(null);
  const location = import.meta.env.VITE_APP_API;
  const getStompClient = () => clientRef.current;

  useEffect(() => {
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
      console.log(data);
      // notifications를 id 기준으로 역순 정렬
      const sortedNotifications = data.sort((a, b) => b.id - a.id);
      console.log(sortedNotifications);

      // 여기서 notifications 상태 업데이트
      setNotifications(sortedNotifications);

      // WebSocket 연결 설정
      const socket = new SockJS('https://subdomain.now-waypoint.store:8080/main');
      const stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        onConnect: () => {
          console.log('WebSocket connected!');
          clientRef.current = stompClient;
          setClient(stompClient);

          stompClient.subscribe(`/queue/notify/${localStorage.getItem('nickname') || ''}`, (messageOutput: IMessage) => {
            console.log('Received notification:', messageOutput.body);
            const data = JSON.parse(messageOutput.body);
            const newNotification: Notification = {
              id: data.id,
              nickname: data.nickname,
              profileImageUrl: data.profileImageUrl,
              message: data.message,
              createDate: data.createDate,
            };
            setNotifications((prevNotifications) => {
              if (!prevNotifications.some(notification => notification.id === newNotification.id)) {
                return [newNotification, ...prevNotifications];
              }
              return prevNotifications;
            });
          });

          stompClient.subscribe(`/queue/posts/${localStorage.getItem('nickname') || ''}`, (messageOutput: IMessage) => {
            console.log('Received post notification:', messageOutput.body);
          });
          setIsLoading(false);
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected!');
          setIsLoading(false);
        },
        onStompError: (frame) => {
          console.error('Broker reported error: ' + frame.headers['message']);
          console.error('Additional details: ' + frame.body);
          setIsLoading(false);
        },
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
      });

      stompClient.activate();

    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  fetchNotifications();

  return () => {
    if (clientRef.current) {
      clientRef.current.deactivate();
    }
    console.log('WebSocket connection closed');
  };
}, []);

  return (
    <WebSocketContext.Provider value={{ client, notifications, isLoading, getStompClient }}>
      {children}
    </WebSocketContext.Provider>
  );
};