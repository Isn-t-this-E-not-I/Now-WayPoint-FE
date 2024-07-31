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
  const [mapLevel, setMapLevel] = useState<number>(11)
  const [isInitialized, setIsInitialized] = useState(false)
  const markersRef = useRef<any[]>([])
  const clustererRef = useRef<any>(null)
  const overlayRef = useRef<any>(null)

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

  const displayCustomOverlay = (map: any, marker: any, item: any) => {
    const content = document.createElement('div')
    content.className = 'overlaybox'

    content.innerHTML = `
      <div class="overlaybox">
        <div onclick="closeOverlay()" class="closeBtn">x</div>
        <div id="main_maker_img">
          <img alt="게시글 이미지" src='${item.category === 'PHOTO' ? (item.mediaUrls && item.mediaUrls.length > 0 ? item.mediaUrls[0] : '') : 'https://cdn-icons-png.flaticon.com/128/11542/11542598.png'}'></img>
        </div>
        <div id="main_maker_name">이름 : ${item.username}</div>
        <div id="main_maker_create">${formatDate(item.createdAt)}</div>    
      </div>
    `

    const overlay = new window.kakao.maps.CustomOverlay({
      content: content,
      map: map,
      position: marker.getPosition(),
    })

    overlay.setMap(map)
    overlayRef.current = overlay

    const closeBtn = content.querySelector('.closeBtn')
    closeBtn?.addEventListener('click', () => {
      overlay.setMap(null)
    })

    // const imgDiv = content.querySelector('#main_maker_img')
    // imgDiv?.addEventListener('click', () => {
    //   detail_navigate(item.postId)
    // })
  }

  // const detail_navigate = (postId: any) => {
  //   window.location.href = `detailContent/${postId}`
  // }

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
          console.log(receivedData)
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
      <div
        ref={mapContainer}
        style={{ width: '100%', height: '100vh', position: 'relative' }}
      />
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
