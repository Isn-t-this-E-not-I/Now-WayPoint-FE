// import React, { useEffect } from 'react'
// import { useLocation } from 'react-router-dom'
// import SockJS from 'sockjs-client'
// import { Client } from '@stomp/stompjs'

// const MainPage: React.FC = () => {
//   const location = useLocation()
//   // const token = location.state?.token; // state에서 token을 가져옴
//   const token = localStorage.getItem('token')
//   const nickname = localStorage.getItem('nickname')

//   useEffect(() => {
//     if (!token) {
//       console.log('No token provided')
//       return
//     }

//     // SockJS와 Stomp 클라이언트 구성
//     const sock = new SockJS('https://subdomain.now-waypoint.store:8080/main')
//     console.log(token)
//     const stompClient = new Client({
//       webSocketFactory: () => sock,
//       connectHeaders: {
//         // 헤더에 토큰값 넣어줌
//         Authorization: `Bearer ${token}`,
//       },
//       onConnect: () => {
//         console.log('Websocket connected!')
//         stompClient.subscribe(
//           '/queue/notify/' + nickname,
//           function (messageOutput) {
//             console.log(messageOutput.body)
//           }
//         )
//         stompClient.subscribe(
//           '/queue/posts/' + nickname,
//           function (messageOutput) {
//             console.log(messageOutput.body)
//           }
//         )
//         // stompClient.subscribe('/topic/messages', (message) => {
//         //   console.log('Received:', message.body);
//         // });
//       },
//       onStompError: (frame) => {
//         console.error('Broker reported error: ' + frame.headers['message'])
//         console.error('Additional details: ' + frame.body)
//       },
//       debug: (str) => {
//         console.log('STOMP Debug:', str)
//       },
//     })

//     stompClient.activate() // 웹소켓 연결 활성화

//     return () => {
//       stompClient.deactivate() // 연결 해제
//       console.log('Websocket disconnected')
//     }
//   }, [token])

//   return (
//     <div>
//       <h1>Welcome to the Main Page</h1>
//       <p>Your token is: {token}</p> // 토큰
//     </div>
//   )
// }

// export default MainPage
