// import React, { useRef, useEffect, useState } from 'react'
// import { getKakaoApiData } from '@/api/KaKaomap/kakaomap'
// import { useLocation } from 'react-router-dom'
// import SockJS from 'sockjs-client'
// import { Client, IMessage } from '@stomp/stompjs'
// import '@/styles/kakaomap.css'
// import { useWebSocket } from '@/components/WebSocketProvider/WebSocketProvider'

// declare global {
//   interface Window {
//     kakao: any
//   }
// }

// const MainPage: React.FC = () => {
//   const mapContainer = useRef<HTMLDivElement>(null)
//   const location = useLocation()
//   const [token, setToken] = useState(localStorage.getItem('token'))
//   const [nickname, setNickname] = useState(localStorage.getItem('nickname'))
//   const [locate, setLocate] = useState('')
//   // const [stompClient, setStompClient] = useState<Client | null>(null)
//   // const [isConnected, setIsConnected] = useState(false)
//   const [data, setData] = useState<any[]>([])
//   const [map, setMap] = useState<any>(null) // 지도 객체 상태 추가
//   const [mapLevel, setMapLevel] = useState<number>(1) // 지도 확대/축소 레벨 상태 추가
//   const [isInitialized, setIsInitialized] = useState(false) // 초기화 상태 추가
//   const client = useWebSocket()

//   // 쿠키 값을 가져와 로컬스토리지에 저장하는 함수
//   const saveTokenToLocalStorage = () => {
//     const getCookie = (name: string) => {
//       let cookieArr = document.cookie.split(';')
//       for (let i = 0; i < cookieArr.length; i++) {
//         let cookiePair = cookieArr[i].split('=')
//         if (name === cookiePair[0].trim()) {
//           return decodeURIComponent(cookiePair[1])
//         }
//       }
//       return null
//     }

//     const authToken = getCookie('Authorization') // "Authorization" 쿠키 값을 가져옴
//     if (authToken) {
//       localStorage.setItem('token', authToken)
//       setToken(authToken) // 상태 업데이트
//     }

//     const userNickname = getCookie('nickname') // "nickname" 쿠키 값을 가져옴
//     if (userNickname) {
//       localStorage.setItem('nickname', userNickname)
//       setNickname(userNickname) // 상태 업데이트
//     }
//   }

//   useEffect(() => {
//     saveTokenToLocalStorage()
//   }, [])

//   useEffect(() => {
//     if (client && locate && nickname) {
//       // 로그 출력 추가
//       console.log('Subscribing to:', `/queue/${locate}/${nickname}`)

//       const subscription = client.subscribe(
//         `/queue/${locate}/${nickname}`,
//         (messageOutput: IMessage) => {
//           console.log('Message received:', messageOutput.body)
//           const receivedData = JSON.parse(messageOutput.body)
//           setData(receivedData)
//           console.log('Parsed data:', receivedData)
//           // 데이터를 받아온 후에 마커 추가
//           if (map) {
//             addMarkers(map, receivedData)
//           }
//         }
//       )

//       return () => {
//         if (subscription) subscription.unsubscribe()
//       }
//     }
//   }, [client, locate, nickname, map])

//   const initializeMap = (latitude: number, longitude: number) => {
//     const script = document.createElement('script')
//     script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=2e253b59d2cc8f52b94e061355413a9e&autoload=false`
//     script.onload = () => {
//       window.kakao.maps.load(() => {
//         const mapOption = {
//           center: new window.kakao.maps.LatLng(latitude, longitude),
//           level: mapLevel, // 초기 레벨 설정
//         }

//         const map = new window.kakao.maps.Map(mapContainer.current, mapOption)
//         setMap(map) // 지도 객체 저장

//         // 지도 레벨 변경 시 상태 업데이트
//         window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
//           setMapLevel(map.getLevel())
//         })

//         setIsInitialized(true) // 지도 초기화 완료 상태 설정
//       })
//     }

//     document.head.appendChild(script)
//   }

//   const addMarkers = (map: any, data: any[]) => {
//     // 기존 마커 제거
//     map.markers?.forEach((marker: { setMap: (arg0: null) => any }) =>
//       marker.setMap(null)
//     )
//     map.markers = []

//     data.forEach((item) => {
//       const [lng, lat] = item.locationTag.split(',').map(Number)
//       const position = new window.kakao.maps.LatLng(lat, lng)

//       let marker
//       if (item.category === 'PHOTO') {
//         const content = `
//           <div class="customoverlay">
//             <div class="customoverlay-img" style="background-image: url('${item.mediaUrls[0]}');"></div>
//             <div class="customoverlay-tail"></div>
//           </div>
//         `
//         marker = new window.kakao.maps.CustomOverlay({
//           map,
//           position,
//           content,
//           yAnchor: 1,
//         })

//         // 커스텀 오버레이를 지도에 추가한 후에 visible 클래스를 추가합니다.
//         setTimeout(() => {
//           const overlayElement = document.querySelector('.customoverlay')
//           if (overlayElement) {
//             overlayElement.classList.add('visible')
//           }
//         }, 100)
//       } else {
//         marker = new window.kakao.maps.Marker({
//           map,
//           position,
//         })
//       }
//       map.markers.push(marker)
//     })
//   }

//   useEffect(() => {
//     // 지도 출력
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const latitude = position.coords.latitude // 위도
//           const longitude = position.coords.longitude // 경도

//           try {
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

//   useEffect(() => {
//     if (isInitialized && client) {
//       selectCategory('ALL')
//     }
//   }, [isInitialized, client])

//   const selectCategory = (category: string) => {
//     if (client) {
//       client.publish({
//         destination: '/app/main/category',
//         body: JSON.stringify({ category: category }),
//       })
//       // 카테고리 선택 시 지도의 확대/축소 레벨 고정
//       if (map) {
//         map.setLevel(mapLevel)
//       }
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
import { Client, IMessage } from '@stomp/stompjs'
import '@/styles/kakaomap.css'
import { useWebSocket } from '@/components/WebSocketProvider/WebSocketProvider'

declare global {
  interface Window {
    kakao: any
  }
}

const MainPage: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [nickname, setNickname] = useState(localStorage.getItem('nickname'))
  const [locate, setLocate] = useState('')
  const [data, setData] = useState<any[]>([])
  const [map, setMap] = useState<any>(null)
  const [mapLevel, setMapLevel] = useState<number>(11)
  const [isInitialized, setIsInitialized] = useState(false)
  const markersRef = useRef<any[]>([])
  const clustererRef = useRef<any>(null)
  const overlayRef = useRef<any>(null)
  const client = useWebSocket()

  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const saveTokenToLocalStorage = () => {
    const getCookie = (name: string) => {
      let cookieArr = document.cookie.split(';')
      for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split('=')
        if (name === cookiePair[0].trim()) {
          return decodeURIComponent(cookiePair[1])
        }
      }
      return null
    }

    const authToken = getCookie('Authorization')
    if (authToken) {
      localStorage.setItem('token', authToken)
      setToken(authToken)
    }

    const userNickname = getCookie('nickname')
    if (userNickname) {
      localStorage.setItem('nickname', userNickname)
      setNickname(userNickname)
    }
  }

  const initializeMap = (latitude: number, longitude: number) => {
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=2e253b59d2cc8f52b94e061355413a9e&libraries=services,clusterer&autoload=false`
    script.onload = () => {
      window.kakao.maps.load(() => {
        const mapOption = {
          center: new window.kakao.maps.LatLng(latitude, longitude),
          level: mapLevel,
        }

        const map = new window.kakao.maps.Map(mapContainer.current, mapOption)
        setMap(map)

        const clusterer = new window.kakao.maps.MarkerClusterer({
          map: map,
          averageCenter: true,
          minLevel: 3, // 클러스터 할 최소 지도 레벨 설정
        })

        // 클러스터러에 클릭 이벤트 추가
        window.kakao.maps.event.addListener(
          clusterer,
          'clusterclick',
          (cluster: { getCenter: () => any }) => {
            const level = map.getLevel() - 1
            map.setLevel(level, { anchor: cluster.getCenter(), animate: true })
          }
        )

        clustererRef.current = clusterer

        window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
          setMapLevel(map.getLevel())
        })

        setIsInitialized(true)
      })
    }

    document.head.appendChild(script)
  }

  const adjustMarkerPosition = (markers: any[]) => {
    const adjustedPositions = new Set()
    const OFFSET = 0.0001 // 마커를 이동시킬 거리

    markers.forEach((marker) => {
      let position = marker.getPosition()
      let lat = position.getLat()
      let lng = position.getLng()
      let newPosition = `${lat},${lng}`

      while (adjustedPositions.has(newPosition)) {
        lat += OFFSET
        lng += OFFSET
        newPosition = `${lat},${lng}`
      }

      adjustedPositions.add(newPosition)
      marker.setPosition(new window.kakao.maps.LatLng(lat, lng))
    })
  }

  const addMarkers = (map: any, data: any[]) => {
    if (clustererRef.current) {
      clustererRef.current.clear()
    }

    const markers = data.map((item) => {
      const [lng, lat] = item.locationTag.split(',').map(Number)
      const position = new window.kakao.maps.LatLng(lat, lng)

      const markerImageSrc = getMarkerImageSrc(item.category)
      const markerImageSize = new window.kakao.maps.Size(35, 35)
      const markerImage = new window.kakao.maps.MarkerImage(
        markerImageSrc,
        markerImageSize
      )
      console.log(item, 123123131231)

      const marker = new window.kakao.maps.Marker({
        position,
        image: markerImage,
      })

      window.kakao.maps.event.addListener(marker, 'click', () => {
        displayCustomOverlay(map, marker, item)
      })

      return marker
    })

    adjustMarkerPosition(markers)

    markersRef.current = markers
    if (clustererRef.current) {
      clustererRef.current.addMarkers(markers)
    }
  }

  const getMarkerImageSrc = (category: string) => {
    switch (category) {
      case 'PHOTO':
        return 'https://cdn-icons-png.flaticon.com/128/4503/4503874.png'
      case 'VIDEO':
        return 'https://cdn-icons-png.flaticon.com/128/2703/2703920.png'
      case 'MP3':
        return 'https://cdn-icons-png.flaticon.com/128/6527/6527906.png'
      default:
        return 'https://cdn-icons-png.flaticon.com/128/2536/2536670.png'
    }
  }

  const displayCustomOverlay = (
    map: any,
    marker: { getPosition: () => any },
    item: {
      mediaUrls: string | any[]
      username: any
      createdAt: string | number | Date
      id: any
      category: string // 추가: category 속성
    }
  ) => {
    const content = document.createElement('div')
    content.className = 'overlaybox'
    content.innerHTML = `
      <div class="closeBtn">x</div>
      <div id="main_maker_img">
        <img alt="게시글 이미지" src='${item.category === 'PHOTO' ? (item.mediaUrls && item.mediaUrls.length > 0 ? item.mediaUrls[0] : '') : 'https://example.com/dummy.jpg'}'></img>
      </div>
      <div id="main_maker_name">이름 : ${item.username}</div>
      <div id="main_maker_create">${formatDate(item.createdAt)}</div>    
    `

    const overlay = new window.kakao.maps.CustomOverlay({
      content: content,
      map: map,
      position: marker.getPosition(),
    })

    overlay.setMap(map)
    overlayRef.current = overlay

    // Close button 이벤트 추가
    const closeBtn = content.querySelector('.closeBtn')
    closeBtn?.addEventListener('click', () => {
      overlay.setMap(null)
    })

    // detail_navigate 이벤트 추가
    const imgDiv = content.querySelector('#main_maker_img')
    imgDiv?.addEventListener('click', () => {
      detail_navigate(item.id)
    })
  }

  const detail_navigate = (postId: any) => {
    window.location.href = `detailContent/${postId}`
  }

  useEffect(() => {
    saveTokenToLocalStorage()

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude

          try {
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
  }, [])

  useEffect(() => {
    if (client && locate && nickname) {
      // 로그 출력 추가
      console.log('Subscribing to:', `/queue/${locate}/${nickname}`)

      const subscription = client.subscribe(
        `/queue/${locate}/${nickname}`,
        (messageOutput: IMessage) => {
          console.log('Message received:', messageOutput.body)
          const receivedData = JSON.parse(messageOutput.body)
          setData(receivedData)
          console.log('Parsed data:', receivedData)
          // 데이터를 받아온 후에 마커 추가
          if (map) {
            addMarkers(map, receivedData)
          }
        }
      )

      return () => {
        if (subscription) subscription.unsubscribe()
      }
    }
  }, [client, locate, nickname, map])

  useEffect(() => {
    if (data.length > 0 && map) {
      console.log(data)
      addMarkers(map, data)
    }
  }, [data, map])

  useEffect(() => {
    if (isInitialized && client) {
      selectCategory('ALL')
    }
  }, [isInitialized, client])

  const selectCategory = (category: string) => {
    if (client) {
      client.publish({
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
      <div
        ref={mapContainer}
        style={{ width: '100%', height: '100vh', position: 'relative' }}
      />
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
