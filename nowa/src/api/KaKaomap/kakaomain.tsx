import React, { useRef, useEffect } from 'react'
import { getKakaoApiData } from '@/api/KaKaomap/kakaomap'
import { useLocation } from 'react-router-dom'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

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
    //지도 출력
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude

          try {
            // const mapData =
            await getKakaoApiData(`${latitude},${longitude}`)

            initializeMap(latitude, longitude)
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

    // SockJS와 Stomp 클라이언트 구성
    if (!token) {
      console.log('No token provided')
      return
    }

    const sock = new SockJS('http://15.165.236.244:8080/main')
    console.log(token)
    const stompClient = new Client({
      webSocketFactory: () => sock,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        console.log('Websocket connected!')
        stompClient.subscribe(
          `/queue/notify/${nickname}`,
          function (messageOutput) {
            console.log(messageOutput.body)
          }
        )
        stompClient.subscribe(
          `/topic/follower/${nickname}`,
          function (messageOutput) {
            console.log(messageOutput.body)
          }
        )
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message'])
        console.error('Additional details: ' + frame.body)
      },
      debug: (str) => {
        console.log('STOMP Debug:', str)
      },
    })

    stompClient.activate()

    return () => {
      stompClient.deactivate()
      console.log('Websocket disconnected')
    }
  }, [token, nickname])

  return (
    <div>
      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
    </div>
  )
}

export default MainPage
