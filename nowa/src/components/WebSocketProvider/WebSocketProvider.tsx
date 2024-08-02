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
}

const WebSocketContext = createContext<WebSocketContextProps>({
  client: null,
  notifications: [],
  isLoading: true,
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

  const initialNotifications: Notification[] = [
    {
      id: 10000,
      nickname: 'InitialUser1',
      message: 'You have a new follower!',
      profileImageUrl: 'https://via.placeholder.com/40',
      createDate: new Date().toISOString(),
    },
    {
      id: 20000,
      nickname: 'InitialUser2',
      message: 'Your post got 5 likes!',
      profileImageUrl: 'https://via.placeholder.com/40',
      createDate: new Date().toISOString(),
    },
    {
      id: 30000,
      nickname: 'InitialUser3',
      message: 'New comment on your post!',
      profileImageUrl: 'https://via.placeholder.com/40',
      createDate: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    setNotifications(initialNotifications);

    const socket = new SockJS('https://subdomain.now-waypoint.store:8080/main');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
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

          setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
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

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
      console.log('WebSocket connection closed');
    };

  }, []);

  useEffect(() => {
    console.log('Updated notifications:', notifications);
  }, [notifications]);

  return (
    <WebSocketContext.Provider value={{ client, notifications, isLoading }}>
      {children}
    </WebSocketContext.Provider>
  );
};