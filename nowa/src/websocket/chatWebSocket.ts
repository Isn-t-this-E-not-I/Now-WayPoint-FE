import { useState } from 'react'
import { CompatClient, Stomp } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ChatRoom, ChatMessage } from '@/types'
import { useChat } from '@/context/chatContext'

let stompClient: CompatClient | null = null
let chatRoomSubscription: any = null
export const getStompClient = () => stompClient;

export const useChatWebSocket = () => {
  const { setChatRooms, setMessages } = useChat();
  // const token = useState<string>(localStorage.getItem('token') || '');
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJzb2wxQHNvbC5jb20iLCJpYXQiOjE3MjE5NTc2NDYsImV4cCI6MTcyMjU2MjQ0Nn0.iC-NBMHmXB8LUEIOThpjVlE8gzC4UjDsXUC_lK0z7v9PKLaGQaUxyqA1Do5EMY4v'

  const connectAndSubscribe = (userNickname: string, onError: (error: any) => void) => {
    const socket = new SockJS('https://subdomain.now-waypoint.store:8080/ws');
    stompClient = Stomp.over(() => socket);

    const token = localStorage.getItem('token') || '';

    const onConnect = () => {
      stompClient!.subscribe(`/queue/chatroom/${userNickname}`, (message) => handleMessageUser(message));
    };

    stompClient.connect({ Authorization: `Bearer ${token}` }, onConnect, onError);
  };

  const disconnect = () => {
    if (stompClient) {
      stompClient.disconnect(() => {
        console.log('Disconnected');
      });
      stompClient = null;
    }
  };

  const subscribeToChatRoom = (chatRoomId: number) => {
    if (stompClient) {
      if (chatRoomSubscription) {
        chatRoomSubscription.unsubscribe();
      }

      chatRoomSubscription = stompClient.subscribe(
        `/topic/chatRoom/${chatRoomId}`,
        (message) => handleMessageChatRoom(message),
        { Authorization: `Bearer ${token}` }
      );
      return chatRoomSubscription;
    } else {
      console.error('WebSocket is not connected.');
    }
  };

  const handleMessageUser = (message: { body: string }) => {
    const parsedMessage = JSON.parse(message.body);
    switch (parsedMessage.messageType) {
      case 'CREATE':
        const newChatRoom: ChatRoom = {
          chatRoomId: parsedMessage.chatRoom.chatRoomId,
          chatRoomName: parsedMessage.chatRoom.chatRoomName,
          userCount: parsedMessage.chatRoom.userCount,
          profilePic: '',
          lastMessage: '',
          messages: [],
        };
        setChatRooms((prevChatRooms) => [...prevChatRooms, newChatRoom]);
        break;
      case 'CHAT_LIST':
        const newMessages: ChatMessage[] = parsedMessage.messages;
        setMessages(newMessages);
        break;
      default:
        break;
    }
  };

  const handleMessageChatRoom = (message: { body: string }) => {
    const parsedMessage = JSON.parse(message.body);
    switch (parsedMessage.messageType) {
      case 'CHAT_LIST':
        // handle chat list updates
        break;
      default:
        break;
    }
  };

  return {
    connectAndSubscribe,
    disconnect,
    subscribeToChatRoom,
  };
};





















// const { setChatRooms, setMessages } = useChat()

// export const getStompClient = () => stompClient;
// const token = useState<string>(localStorage.getItem('token') || '');

// // WebSocket 연결 및 구독 함수
// export const connectAndSubscribe = (
//   userNickname: string,
//   onError: (error: any) => void
// ) => {
//   const socket = new SockJS('https://subdomain.now-waypoint.store:8080/ws')
//   stompClient = Stomp.over(() => socket)

//   // 연결 성공 시 호출되는 콜백
//   const onConnect = () => {
//     // 채팅방 목록을 구독하고 메시지를 수신할 때 handleMessage를 호출
//     stompClient!.subscribe(
//       `/queue/chatroom/${userNickname}`,
//       (message) => handleMessageUser(message)
//     )
//   }

//   stompClient.connect({ Authorization: `Bearer ${token}` }, onConnect, onError)
// }

// export const disconnect = () => {
//   if (stompClient) {
//     // WebSocket 연결 종료
//     stompClient.disconnect(() => {
//       console.log('Disconnected')
//     })
//     stompClient = null
//   }
// }

// // 새로운 채팅방 구독 함수
// export const subscribeToChatRoom = (
//   chatRoomId: number
// ) => {
//   if (stompClient) {
//     // 기존 구독이 있는 경우 해지
//     if (chatRoomSubscription) {
//       chatRoomSubscription.unsubscribe()
//     }

//     // 새로운 채팅방 구독
//     chatRoomSubscription = stompClient.subscribe(
//       `/topic/chatRoom/${chatRoomId}`,
//       (message) => handleMessageChatRoom(message),
//       { Authorization: `Bearer ${token}` }
//     )
//     return chatRoomSubscription
//   } else {
//     console.error('WebSocket is not connected.')
//   }
// }

// // 메시지 처리 로직 /queue/chatRoom/userNickname으로 오는 것들

// // 채팅방 생성 - CREATE                        -> 채팅방 목록 조회 setChatRoom으로 
// // 채팅 메시지생성 - CHAT                       -> 채팅방 목록 조회
// // 채팅방 메시지 조회, 이전 메시지 조회 - CHAT_LIST  -> 리액트 상태 ChatMessage리스트 설정
// // 특정 채팅방의 업데이트 정보를 조회 - UPDATE       -> 리액트 chatrooms, chatroomsInfo 설정
// // 채팅방 유저 초대 - INVITE                    -> 채팅방 목록 조회
// // 채팅방 나가기 - LEAVE                       -> 채팅방 목록 조회
// export const handleMessageUser = (
//   message: { body: string },
// ) => {
//   const parsedMessage = JSON.parse(message.body)
//   switch (parsedMessage.messageType) {
//     case 'CREATE':
//       const newChatRoom: ChatRoom = {
//         chatRoomId: parsedMessage.chatRoom.chatRoomId,
//         chatRoomName: parsedMessage.chatRoom.chatRoomName, // 문자열로 직접 사용
//         userCount: parsedMessage.chatRoom.userCount, // 숫자로 직접 사용
//         profilePic: '', // 프로필 사진이 없다면 빈 문자열로 초기화
//         lastMessage: '', // 마지막 메시지가 없다면 빈 문자열로 초기화
//         messages: [], // 메시지가 없다면 빈 배열로 초기화
//       }

//       // 이전 채팅방 목록을 가져와서 새로운 채팅방을 추가
//       setChatRooms((prevChatRooms) => [...prevChatRooms, newChatRoom])

//       break
//     case 'CHAT_LIST':
//       const newMessages: ChatMessage[] = parsedMessage.messages; // 메시지 리스트를 파싱합니다
//       setMessages(newMessages); // 이전 메시지 리스트를 갱신합니다.

//       break

//     case 'FDAF':

//       break
//     default:
//       break
//   }
// }

// // 채팅방 메시지 처리 로직 /topic/chatroom/chatroomId
// // 메시지 전송 - CHAT
// // 채팅방 이름 업데이트 - NAME_UPDATE
// export const handleMessageChatRoom = (
//   message: { body: string },
// ) => {
//   const parsedMessage = JSON.parse(message.body)
//   switch (parsedMessage.messageType) {
//     case 'CHAT_LIST':
//       break
//     default:
//       break
//   }
// }
