import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';


const MainPage: React.FC = () => {
  const location = useLocation();
  const token = location.state?.token;

  useEffect(() => {
    const token1 = localStorage.getItem('token');
    console.log(token1);
    const sock = new SockJS('/main');
    const stompClient = new Client({
      webSocketFactory: () => sock,
      connectHeaders: {
        'Authorization': `Bearer ${token}`  // 토큰을 헤더에 포함시킵니다.
      },
      onConnect: () => {
        console.log('Websocket connected!');
        stompClient.subscribe('/topic/messages', (message) => {
          console.log('Received:', message.body);
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      debug: (str) => {
        console.log('STOMP Debug: ' + str);
      }
    });

    stompClient.activate();  // 웹소켓 연결 활성화

    return () => {
      stompClient.deactivate();  // 컴포넌트 언마운트 시 웹소켓 연결 해제
      console.log('Websocket disconnected');
    };
  }, [token]);  // token이 변경될 때마다 연결을 재설정

return (
  <div>
    <h1>Welcome to the Main Page</h1>
    <p>Your token is: {token}</p>
  </div>
);
};

export default MainPage;