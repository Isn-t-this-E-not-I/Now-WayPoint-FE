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

export interface FollowContent {
  id: number; // 게시물 ID
  content: string; // 게시물 내용
  hashtags: string[]; // 해시태그 배열
  category: string; // 카테고리
  createdAt: string; // 생성 날짜 및 시간 (문자열 표현)
  likeCount: number; // 좋아요 수 (숫자)
  mediaUrls: string[]; // 미디어 URL 배열
  username: string; // 사용자 이름
  profileImageUrl: string; // 사용자 프로필 이미지 URL
}

interface WebSocketContextProps {
  client: Client | null;
  notifications: Notification[];
  followContents: FollowContent[];
  selectContents: FollowContent[];
  isLoading: boolean;
  getStompClient: () => Client | null;
}

const WebSocketContext = createContext<WebSocketContextProps>({
  client: null,
  notifications: [],
  followContents: [],
  selectContents: [],
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
  const [followContents, setFollowContents] = useState<FollowContent[]>([]);
  const [selectContents, setSelectContents] = useState<FollowContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const clientRef = useRef<Client | null>(null);
  const location = import.meta.env.VITE_APP_API;
  const getStompClient = () => clientRef.current;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await fetch(`${location}/notify`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Network response was not ok');

        const data: Notification[] = await response.json();
        setNotifications(data.sort((a, b) => b.id - a.id));

        const responseFollowContent = await fetch(`${location}/follow/list`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!responseFollowContent.ok) throw new Error('Network response was not ok');

        // responseFollowContent를 사용하여 JSON 데이터 가져오기
        const dataContent: FollowContent[] = await responseFollowContent.json();

        // 날짜를 기반으로 정렬 (문자열을 Date 객체로 변환하여 비교)
        setFollowContents(dataContent.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        console.log(dataContent);

        const socket = new SockJS('https://subdomain.now-waypoint.store:8080/main');
        const stompClient = new Client({
          webSocketFactory: () => socket,
          connectHeaders: { Authorization: `Bearer ${token}` },
          onConnect: () => {
            console.log('WebSocket connected!');
            clientRef.current = stompClient;
            setClient(stompClient);

            stompClient.subscribe(`/queue/notify/${localStorage.getItem('nickname') || ''}`, (messageOutput: IMessage) => {
              const data = JSON.parse(messageOutput.body);
              const newNotification: Notification = {
                id: data.id,
                nickname: data.nickname,
                profileImageUrl: data.profileImageUrl,
                message: data.message,
                createDate: data.createDate,
              };
              setNotifications((prev) => !prev.some((n) => n.id === newNotification.id) ? [newNotification, ...prev] : prev);
            });

            stompClient.subscribe(`/queue/posts/${localStorage.getItem('nickname') || ''}`, (messageOutput: IMessage) => {
              const data = JSON.parse(messageOutput.body);
              const newFollowContent: FollowContent = {
                id: data.id,
                content: data.content,
                hashtags: data.hashtags,
                category: data.category,
                createdAt: data.createdAt,
                likeCount: data.likeCount || 0,
                mediaUrls: data.mediaUrls,
                username: data.username,
                profileImageUrl: data.profileImageUrl
              };

              setFollowContents((prev) => !prev.some((f) => f.id === newFollowContent.id) ? [newFollowContent, ...prev] : prev);
            });

            stompClient.subscribe(`/queue/category/${localStorage.getItem('nickname') || ''}`, (messageOutput: IMessage) => {
              // JSON 파싱 및 배열 형태로 변환
              const data: FollowContent[] = JSON.parse(messageOutput.body);

              // 각 항목을 newSelectContent로 변환하고 상태 업데이트
              const newSelectContents = data.map((item) => ({
                id: item.id,
                content: item.content,
                hashtags: item.hashtags,
                category: item.category,
                createdAt: item.createdAt,
                likeCount: item.likeCount || 0,
                mediaUrls: item.mediaUrls,
                username: item.username,
                profileImageUrl: item.profileImageUrl
              }));

              // 기존의 selectContents 배열에 새로운 데이터를 추가
              setSelectContents(newSelectContents);
            });

            setIsLoading(false);
          },
          onDisconnect: () => {
            console.log('WebSocket disconnected!');
            setIsLoading(false);
          },
          onStompError: (frame) => {
            console.error('Broker reported error:', frame.headers['message']);
            console.error('Additional details:', frame.body);
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

  useEffect(() => {
    console.log('Updated follow contents:', followContents);
  }, [followContents]);

  return (
    <WebSocketContext.Provider value={{ client, notifications, followContents, selectContents, isLoading, getStompClient }}>
      {children}
    </WebSocketContext.Provider>
  );
};