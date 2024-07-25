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
          `/topic/${locate}/${nickname}`,
          (messageOutput: IMessage) => {
            console.log(messageOutput.body)
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
          level: 1,
        }

        const map = new window.kakao.maps.Map(mapContainer.current, mapOption)

        // new window.kakao.maps.Marker({
        //   map,
        //   position: new window.kakao.maps.LatLng(latitude, longitude),
        // })
      })
    }

    document.head.appendChild(script)
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

            setLocate(`${latitude},${longitude}`)
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

  const selectCategory = (category: string) => {
    if (stompClient && isConnected) {
      const response = stompClient.publish({
        destination: '/app/main/category',
        body: JSON.stringify({ category: category }),
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
          id="categorybtn1"
          onClick={() => selectCategory('PHOTO')}
        >
          식당
        </button>
        <button
          className="categoryButtons"
          id="categorybtn2"
          onClick={() => selectCategory('VIDEO')}
        >
          카페
        </button>
        <button
          className="categoryButtons"
          id="categorybtn3"
          onClick={() => selectCategory('MP3')}
        >
          편의점
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
