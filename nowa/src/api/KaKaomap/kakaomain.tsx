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
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [nickname, setNickname] = useState(localStorage.getItem('nickname'))
  const [locate, setLocate] = useState('')
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [map, setMap] = useState<any>(null)
  const [mapLevel, setMapLevel] = useState<number>(1)
  const [isInitialized, setIsInitialized] = useState(false)
  const markersRef = useRef<any[]>([])

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

  const subscribeToTopics = (client: Client, nickname: string) => {
    client.subscribe(`/queue/notify/${nickname}`, (messageOutput: IMessage) => {
      console.log(messageOutput.body)
    })
    client.subscribe(`/queue/posts/${nickname}`, (messageOutput: IMessage) => {
      console.log(messageOutput.body)
    })
  }

  const initializeMap = (latitude: number, longitude: number) => {
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=2e253b59d2cc8f52b94e061355413a9e&autoload=false`
    script.onload = () => {
      window.kakao.maps.load(() => {
        const mapOption = {
          center: new window.kakao.maps.LatLng(latitude, longitude),
          level: mapLevel,
        }

        const map = new window.kakao.maps.Map(mapContainer.current, mapOption)
        setMap(map)

        window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
          setMapLevel(map.getLevel())
        })

        setIsInitialized(true)
      })
    }

    document.head.appendChild(script)
  }

  const addMarkers = (map: any, data: any[]) => {
    markersRef.current.forEach((marker: any) => marker.setMap(null))
    markersRef.current = []

    data.forEach((item) => {
      const [lng, lat] = item.locationTag.split(',').map(Number)
      const position = new window.kakao.maps.LatLng(lat, lng)

      const markerImageSrc = getMarkerImageSrc(item.category)
      const markerImageSize = new window.kakao.maps.Size(24, 35)
      const markerImage = new window.kakao.maps.MarkerImage(
        markerImageSrc,
        markerImageSize
      )

      const marker = new window.kakao.maps.Marker({
        map,
        position,
        image: markerImage,
      })

      markersRef.current.push(marker)
    })
  }

  const getMarkerImageSrc = (category: string) => {
    switch (category) {
      case 'PHOTO':
        return 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
      case 'VIDEO':
        return 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
      case 'MP3':
        return 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
      default:
        return 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
    }
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

    if (token && nickname) {
      const sock = new SockJS('https://subdomain.now-waypoint.store:8080/main')
      const client = new Client({
        webSocketFactory: () => sock,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        onConnect: () => {
          setIsConnected(true)
          subscribeToTopics(client, nickname)
          setStompClient(client)
        },
        onDisconnect: () => {
          setIsConnected(false)
        },
        onStompError: (frame) => {
          console.error('Broker reported error: ' + frame.headers['message'])
          console.error('Additional details: ' + frame.body)
        },
        debug: (str) => {
          console.log('STOMP Debug:', str)
        },
      })

      client.activate()
      return () => {
        client.deactivate()
      }
    }
  }, [token, nickname])

  useEffect(() => {
    if (isConnected && stompClient && locate) {
      const subscription = stompClient.subscribe(
        `/queue/${locate}/${nickname}`,
        (messageOutput: IMessage) => {
          const receivedData = JSON.parse(messageOutput.body)
          setData(receivedData)
        }
      )
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [isConnected, stompClient, locate, nickname])

  useEffect(() => {
    if (data.length > 0 && map) {
      addMarkers(map, data)
    }
  }, [data, map])

  useEffect(() => {
    if (isInitialized && stompClient && isConnected) {
      selectCategory('ALL')
    }
  }, [isInitialized, stompClient, isConnected])

  const selectCategory = (category: string) => {
    if (stompClient && isConnected) {
      stompClient.publish({
        destination: '/app/main/category',
        body: JSON.stringify({ category }),
      })
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
          onClick={() => selectCategory('PHOTO')}
        >
          사진
        </button>
        <button
          className="categoryButtons"
          onClick={() => selectCategory('VIDEO')}
        >
          동영상
        </button>
        <button
          className="categoryButtons"
          onClick={() => selectCategory('MP3')}
        >
          음악
        </button>
        <button
          className="categoryButtons"
          onClick={() => selectCategory('ALL')}
        >
          전체
        </button>
      </div>
    </div>
  )
}

export default MainPage
