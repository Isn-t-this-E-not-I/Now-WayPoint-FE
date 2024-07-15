// src/pages/MainPage.tsx

import React, { useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const MainPage: React.FC = () => {
  useEffect(() => {
    const socket = new SockJS('http://localhost:8000/ws');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function(frame) {
      console.log('Connected: ' + frame);
      stompClient.subscribe('/topic/messages', function(message) {
        alert('Message: ' + message.body);
      });
    });

    return () => {
      if (stompClient) {
        stompClient.disconnect();
        console.log('Disconnected');
      }
    };
  }, []);

  return (
    <div>
      <h1>Welcome to the Main Page</h1>
    </div>
  );
};

export default MainPage;
