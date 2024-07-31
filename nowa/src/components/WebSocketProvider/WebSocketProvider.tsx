import React, { useEffect, useRef, createContext, useContext, ReactNode, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

const WebSocketContext = createContext<Client | null>(null);

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const socket = new SockJS('https://subdomain.now-waypoint.store:8080/main');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
      onConnect: () => {
        console.log('WebSocket connected!');
        clientRef.current = stompClient;
        setClient(stompClient); // client 설정

        // Common subscriptions
        stompClient.subscribe(`/queue/notify/${localStorage.getItem('nickname') || ''}`, (messageOutput: IMessage) => {
          console.log('기타알람:', messageOutput.body);
        });

        stompClient.subscribe(`/queue/posts/${localStorage.getItem('nickname') || ''}`, (messageOutput: IMessage) => {
            console.log('팔로워 게시글 알람:', messageOutput.body);
          });
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected!');
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
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

  return <WebSocketContext.Provider value={client}>{children}</WebSocketContext.Provider>;
};