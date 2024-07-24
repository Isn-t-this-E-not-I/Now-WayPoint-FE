import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import StompJs, {Message as MessageType, Client} from '@stomp/stompjs';


const MainPage: React.FC = () => {
  const location = useLocation();
  const token = location.state?.token;  // state에서 token을 가져옴

  return (
    <div>
      <h1>Welcome to the Main Page</h1>
      <p>Your token is: {token}</p>  // 토큰 출력
    </div>
  );
};

export default MainPage;
