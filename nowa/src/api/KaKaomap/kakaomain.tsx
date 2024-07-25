// import React, { useRef, useEffect, useState } from 'react'
// import { getKakaoApiData } from '@/api/KaKaomap/kakaomap'
// import { useLocation } from 'react-router-dom'
// import SockJS from 'sockjs-client'
// import { Client, IMessage } from '@stomp/stompjs'
// import '@/styles/kakaomap.css'

// declare global {
//   interface Window {
//     kakao: any
//   }
// }

// const MainPage: React.FC = () => {
//   const mapContainer = useRef<HTMLDivElement>(null)
//   const location = useLocation()
//   const token = localStorage.getItem('token')
//   const nickname = localStorage.getItem('nickname')
//   const [locate, setLocate] = useState('')
//   const [stompClient, setStompClient] = useState<Client | null>(null)
//   const [isConnected, setIsConnected] = useState(false)
//   const [data, setData] = useState<any[]>([])

//   useEffect(() => {
//     const sock = new SockJS('http://15.165.236.244:8080/main')
//     console.log(token)

//     const client = new Client({
//       webSocketFactory: () => sock,
//       connectHeaders: {
//         Authorization: `Bearer ${token}`,
//       },
//       onConnect: (frame) => {
//         console.log('Websocket connected!')
//         setIsConnected(true) // Update connection status
//         client.subscribe(
//           `/queue/notify/${nickname}`,
//           (messageOutput: IMessage) => {
//             console.log(messageOutput.body)
//           }
//         )
//         client.subscribe(
//           `/topic/follower/${nickname}`,
//           (messageOutput: IMessage) => {
//             console.log(messageOutput.body)
//           }
//         )
//         client.subscribe(
//           `/queue/${locate}/${nickname}`,
//           (messageOutput: IMessage) => {
//             console.log(messageOutput.body)
//             const data = JSON.parse(messageOutput.body)
//             setData(data)
//           }
//         )
//       },
//       onDisconnect: () => {
//         console.log('Websocket disconnected!')
//         setIsConnected(false) // Update connection status
//       },
//       onStompError: (frame) => {
//         console.error('Broker reported error: ' + frame.headers['message'])
//         console.error('Additional details: ' + frame.body)
//       },
//       debug: (str) => {
//         console.log('STOMP Debug:', str)
//       },
//     })

//     setStompClient(client)

//     client.activate()

//     return () => {
//       client.deactivate()
//       console.log('Websocket disconnected')
//     }
//   }, [token, nickname, locate])

//   const initializeMap = (latitude: number, longitude: number) => {
//     const script = document.createElement('script')
//     script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=2e253b59d2cc8f52b94e061355413a9e&autoload=false`
//     script.onload = () => {
//       window.kakao.maps.load(() => {
//         const mapOption = {
//           center: new window.kakao.maps.LatLng(latitude, longitude),
//           level: 1,
//         }

//         const map = new window.kakao.maps.Map(mapContainer.current, mapOption)

//         // new window.kakao.maps.Marker({
//         //   map,
//         //   position: new window.kakao.maps.LatLng(latitude, longitude),
//         // })
//       })
//     }

//     document.head.appendChild(script)
//   }

//   useEffect(() => {
//     // 지도 출력
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const latitude = position.coords.latitude //위도
//           const longitude = position.coords.longitude //경도

//           try {
//             // const mapData =
//             await getKakaoApiData(`${latitude},${longitude}`)

//             initializeMap(latitude, longitude)

//             setLocate(`${longitude},${latitude}`)
//           } catch (error) {
//             console.error('지도 초기화 실패:', error)
//           }
//         },
//         (error) => {
//           console.error('위치 정보를 가져오는데 실패했습니다:', error)
//         }
//       )
//     } else {
//       console.error('Geolocation을 지원하지 않는 브라우저입니다.')
//     }
//   }, [])

//   const selectCategory = (category: string) => {
//     if (stompClient && isConnected) {
//       stompClient.publish({
//         destination: '/app/main/category',
//         body: JSON.stringify({ category: category }),
//       })
//     } else {
//       console.error('Not connected to WebSocket')
//     }
//   }

//   return (
//     <div>
//       <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
//       <div id="categoryBox">
//         <button
//           className="categoryButtons"
//           id="categorybtn1"
//           onClick={() => selectCategory('PHOTO')}
//         >
//           사진
//         </button>
//         <button
//           className="categoryButtons"
//           id="categorybtn2"
//           onClick={() => selectCategory('VIDEO')}
//         >
//           동영상
//         </button>
//         <button
//           className="categoryButtons"
//           id="categorybtn3"
//           onClick={() => selectCategory('MP3')}
//         >
//           음악
//         </button>
//         <button
//           className="categoryButtons"
//           id="categorybtn4"
//           onClick={() => selectCategory('ALL')}
//         >
//           전체
//         </button>
//       </div>
//     </div>
//   )
// }

// export default MainPage

// import React, { useRef, useEffect, useState } from 'react'
// import { getKakaoApiData } from '@/api/KaKaomap/kakaomap'
// import { useLocation } from 'react-router-dom'
// import SockJS from 'sockjs-client'
// import { Client, IMessage } from '@stomp/stompjs'
// import '@/styles/kakaomap.css'

// declare global {
//   interface Window {
//     kakao: any
//   }
// }

// const MainPage: React.FC = () => {
//   const mapContainer = useRef<HTMLDivElement>(null)
//   const location = useLocation()
//   const token = localStorage.getItem('token')
//   const nickname = localStorage.getItem('nickname')
//   const [locate, setLocate] = useState('')
//   const [stompClient, setStompClient] = useState<Client | null>(null)
//   const [isConnected, setIsConnected] = useState(false)
//   const [data, setData] = useState<any[]>([])

//   useEffect(() => {
//     const sock = new SockJS('http://15.165.236.244:8080/main')
//     console.log(token)

//     const client = new Client({
//       webSocketFactory: () => sock,
//       connectHeaders: {
//         Authorization: `Bearer ${token}`,
//       },
//       onConnect: (frame) => {
//         console.log('Websocket connected!')
//         setIsConnected(true) // Update connection status
//         client.subscribe(
//           `/queue/notify/${nickname}`,
//           (messageOutput: IMessage) => {
//             console.log(messageOutput.body)
//           }
//         )
//         client.subscribe(
//           `/topic/follower/${nickname}`,
//           (messageOutput: IMessage) => {
//             console.log(messageOutput.body)
//           }
//         )
//         client.subscribe(
//           `/queue/${locate}/${nickname}`,
//           (messageOutput: IMessage) => {
//             console.log(messageOutput.body)
//             const receivedData = JSON.parse(messageOutput.body)
//             setData(receivedData)
//             console.log(receivedData)
//           }
//         )
//       },
//       onDisconnect: () => {
//         console.log('Websocket disconnected!')
//         setIsConnected(false) // Update connection status
//       },
//       onStompError: (frame) => {
//         console.error('Broker reported error: ' + frame.headers['message'])
//         console.error('Additional details: ' + frame.body)
//       },
//       debug: (str) => {
//         console.log('STOMP Debug:', str)
//       },
//     })

//     setStompClient(client)

//     client.activate()

//     return () => {
//       client.deactivate()
//       console.log('Websocket disconnected')
//     }
//   }, [token, nickname, locate])

//   const initializeMap = (latitude: number, longitude: number) => {
//     const script = document.createElement('script')
//     script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=2e253b59d2cc8f52b94e061355413a9e&autoload=false`
//     script.onload = () => {
//       window.kakao.maps.load(() => {
//         const mapOption = {
//           center: new window.kakao.maps.LatLng(latitude, longitude),
//           level: 1,
//         }

//         const map = new window.kakao.maps.Map(mapContainer.current, mapOption)
//         addMarkers(map, data)
//       })
//     }

//     document.head.appendChild(script)
//   }

//   const addMarkers = (map: any, data: any[]) => {
//     data.forEach((item) => {
//       const [lng, lat] = item.locationTag.split(',').map(Number)
//       const position = new window.kakao.maps.LatLng(lat, lng)

//       let markerImage = null
//       if (item.category === 'PHOTO') {
//         const imageSize = new window.kakao.maps.Size(64, 69)
//         const imageOption = { offset: new window.kakao.maps.Point(27, 69) }
//         markerImage = new window.kakao.maps.MarkerImage(
//           item.mediaUrls[0],
//           imageSize,
//           imageOption
//         )
//       }

//       const marker = new window.kakao.maps.Marker({
//         map,
//         position,
//         image: markerImage,
//       })
//     })
//   }

//   useEffect(() => {
//     // 지도 출력
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const latitude = position.coords.latitude //위도
//           const longitude = position.coords.longitude //경도

//           try {
//             // const mapData =
//             await getKakaoApiData(`${latitude},${longitude}`)

//             initializeMap(latitude, longitude)

//             setLocate(`${longitude},${latitude}`)
//           } catch (error) {
//             console.error('지도 초기화 실패:', error)
//           }
//         },
//         (error) => {
//           console.error('위치 정보를 가져오는데 실패했습니다:', error)
//         }
//       )
//     } else {
//       console.error('Geolocation을 지원하지 않는 브라우저입니다.')
//     }
//   }, [data])

//   const selectCategory = (category: string) => {
//     if (stompClient && isConnected) {
//       stompClient.publish({
//         destination: '/app/main/category',
//         body: JSON.stringify({ category: category }),
//       })
//     } else {
//       console.error('Not connected to WebSocket')
//     }
//   }

//   return (
//     <div>
//       <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
//       <div id="categoryBox">
//         <button
//           className="categoryButtons"
//           id="categorybtn1"
//           onClick={() => selectCategory('PHOTO')}
//         >
//           사진
//         </button>
//         <button
//           className="categoryButtons"
//           id="categorybtn2"
//           onClick={() => selectCategory('VIDEO')}
//         >
//           동영상
//         </button>
//         <button
//           className="categoryButtons"
//           id="categorybtn3"
//           onClick={() => selectCategory('MP3')}
//         >
//           음악
//         </button>
//         <button
//           className="categoryButtons"
//           id="categorybtn4"
//           onClick={() => selectCategory('ALL')}
//         >
//           전체
//         </button>
//       </div>
//     </div>
//   )
// }

// export default MainPage

import React, { useRef, useEffect, useState } from 'react'
import { getKakaoApiData } from '@/api/KaKaomap/kakaomap'
import { useLocation } from 'react-router-dom'
import SockJS from 'sockjs-client'
import { Client, IMessage } from '@stomp/stompjs'
import '@/styles/kakaomap.css'

declare global {
  interface Window {
    kakao: any
  }
}

const MainPage: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const token = localStorage.getItem('token')
  const nickname = localStorage.getItem('nickname')
  const [locate, setLocate] = useState('')
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [map, setMap] = useState<any>(null) // 지도 객체 상태 추가
  const [mapLevel, setMapLevel] = useState<number>(1) // 지도 확대/축소 레벨 상태 추가

  useEffect(() => {
    const sock = new SockJS('http://15.165.236.244:8080/main')
    console.log(token)

    const client = new Client({
      webSocketFactory: () => sock,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: (frame) => {
        console.log('Websocket connected!')
        setIsConnected(true) // Update connection status
        client.subscribe(
          `/queue/notify/${nickname}`,
          (messageOutput: IMessage) => {
            console.log(messageOutput.body)
          }
        )
        client.subscribe(
          `/topic/follower/${nickname}`,
          (messageOutput: IMessage) => {
            console.log(messageOutput.body)
          }
        )
        client.subscribe(
          `/queue/${locate}/${nickname}`,
          (messageOutput: IMessage) => {
            console.log(messageOutput.body)
            const receivedData = JSON.parse(messageOutput.body)
            setData(receivedData)
            console.log(receivedData)
          }
        )
      },
      onDisconnect: () => {
        console.log('Websocket disconnected!')
        setIsConnected(false) // Update connection status
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message'])
        console.error('Additional details: ' + frame.body)
      },
      debug: (str) => {
        console.log('STOMP Debug:', str)
      },
    })

    setStompClient(client)

    client.activate()

    return () => {
      client.deactivate()
      console.log('Websocket disconnected')
    }
  }, [token, nickname, locate])

  const initializeMap = (latitude: number, longitude: number) => {
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=2e253b59d2cc8f52b94e061355413a9e&autoload=false`
    script.onload = () => {
      window.kakao.maps.load(() => {
        const mapOption = {
          center: new window.kakao.maps.LatLng(latitude, longitude),
          level: mapLevel, // 초기 레벨 설정
        }

        const map = new window.kakao.maps.Map(mapContainer.current, mapOption)
        setMap(map) // 지도 객체 저장

        // 지도 레벨 변경 시 상태 업데이트
        window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
          setMapLevel(map.getLevel())
        })

        addMarkers(map, data)
      })
    }

    document.head.appendChild(script)
  }

  const addMarkers = (map: any, data: any[]) => {
    data.forEach((item) => {
      const [lng, lat] = item.locationTag.split(',').map(Number)
      const position = new window.kakao.maps.LatLng(lat, lng)

      let content = null
      if (item.category === 'PHOTO') {
        content = `
          <div class="customoverlay">
            <div class="customoverlay-img" style="background-image: url('${item.mediaUrls[0]}');"></div>
            <div class="customoverlay-tail"></div>
          </div>
        `
      }

      const customOverlay = new window.kakao.maps.CustomOverlay({
        map,
        position,
        content,
        yAnchor: 1,
      })

      // 커스텀 오버레이를 지도에 추가한 후에 visible 클래스를 추가합니다.
      setTimeout(() => {
        const overlayElement = document.querySelector('.customoverlay')
        if (overlayElement) {
          overlayElement.classList.add('visible')
        }
      }, 100)
    })
  }

  useEffect(() => {
    // 지도 출력
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude //위도
          const longitude = position.coords.longitude //경도

          try {
            // const mapData =
            await getKakaoApiData(`${latitude},${longitude}`)

            initializeMap(latitude, longitude)

            setLocate(`${longitude},${latitude}`)
          } catch (error) {
            console.error('지도 초기화 실패:', error)
          }
        },
        (error) => {
          console.error('위치 정보를 가져오는데 실패했습니다:', error)
        }
      )
    } else {
      console.error('Geolocation을 지원하지 않는 브라우저입니다.')
    }
  }, [data])

  const selectCategory = (category: string) => {
    if (stompClient && isConnected) {
      stompClient.publish({
        destination: '/app/main/category',
        body: JSON.stringify({ category: category }),
      })
      // 카테고리 선택 시 지도의 확대/축소 레벨 고정
      if (map) {
        map.setLevel(mapLevel)
      }
    } else {
      console.error('Not connected to WebSocket')
    }
  }

  return (
    <div>
      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
      <div id="categoryBox">
        <button
          className="categoryButtons"
          id="categorybtn1"
          onClick={() => selectCategory('PHOTO')}
        >
          사진
        </button>
        <button
          className="categoryButtons"
          id="categorybtn2"
          onClick={() => selectCategory('VIDEO')}
        >
          동영상
        </button>
        <button
          className="categoryButtons"
          id="categorybtn3"
          onClick={() => selectCategory('MP3')}
        >
          음악
        </button>
        <button
          className="categoryButtons"
          id="categorybtn4"
          onClick={() => selectCategory('ALL')}
        >
          전체
        </button>
      </div>
    </div>
  )
}

export default MainPage
