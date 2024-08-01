import React, { useRef, useEffect, useState } from 'react'
import { getKakaoApiData } from '@/api/KaKaomap/kakaomap'
import { useLocation } from 'react-router-dom'
import SockJS from 'sockjs-client'
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
  // const [stompClient, setStompClient] = useState<Client | null>(null)
  // const [isConnected, setIsConnected] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [map, setMap] = useState<any>(null) // 지도 객체 상태 추가
  const [mapLevel, setMapLevel] = useState<number>(1) // 지도 확대/축소 레벨 상태 추가
  const [isInitialized, setIsInitialized] = useState(false) // 초기화 상태 추가
  const client = useWebSocket()

  // 쿠키 값을 가져와 로컬스토리지에 저장하는 함수
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

    const authToken = getCookie('Authorization') // "Authorization" 쿠키 값을 가져옴
    if (authToken) {
      localStorage.setItem('token', authToken)
      setToken(authToken) // 상태 업데이트
    }

    const userNickname = getCookie('nickname') // "nickname" 쿠키 값을 가져옴
    if (userNickname) {
      localStorage.setItem('nickname', userNickname)
      setNickname(userNickname) // 상태 업데이트
    }
  }

  useEffect(() => {
    saveTokenToLocalStorage()
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

        setIsInitialized(true) // 지도 초기화 완료 상태 설정
      })
    }

    document.head.appendChild(script)
  }

  const addMarkers = (map: any, data: any[]) => {
    // 기존 마커 제거
    map.markers?.forEach((marker: { setMap: (arg0: null) => any }) =>
      marker.setMap(null)
    )
    map.markers = []

    data.forEach((item) => {
      const [lng, lat] = item.locationTag.split(',').map(Number)
      const position = new window.kakao.maps.LatLng(lat, lng)

      let marker
      if (item.category === 'PHOTO') {
        const content = `
          <div class="customoverlay">
            <div class="customoverlay-img" style="background-image: url('${item.mediaUrls[0]}');"></div>
            <div class="customoverlay-tail"></div>
          </div>
        `
        marker = new window.kakao.maps.CustomOverlay({
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
      } else {
        marker = new window.kakao.maps.Marker({
          map,
          position,
        })
      }
      map.markers.push(marker)
    })
  }

  useEffect(() => {
    // 지도 출력
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude // 위도
          const longitude = position.coords.longitude // 경도

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
