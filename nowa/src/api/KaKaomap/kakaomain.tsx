import React, { useRef, useEffect, useState } from 'react'
import { getKakaoApiData } from '@/api/KaKaomap/kakaomap'
import { useLocation } from 'react-router-dom'
import moment from 'moment-timezone'
import { Client, IMessage } from '@stomp/stompjs'
import '@/styles/kakaomap.css'
import { useWebSocket } from '@/components/WebSocketProvider/WebSocketProvider'
import Select from '@/components/Select/select'
import DetailContentModal from '@/components/Modal/ContentModal'

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
  const [mapLevel, setMapLevel] = useState<number>(7)
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedDistance, setSelectedDistance] = useState<number>(10)
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const markersRef = useRef<any[]>([])
  const clustererRef = useRef<any>(null)
  const overlayRef = useRef<any>(null)
  const client = useWebSocket().client
  const currentLocationRef = useRef<{
    latitude: number
    longitude: number
  } | null>(null)

  const categoryOptions = [
    { id: 'PHOTO', label: '사진' },
    { id: 'VIDEO', label: '동영상' },
    { id: 'MP3', label: '음악' },
    { id: 'ALL', label: '전체' },
  ]

  const distanceOptions = [
    { id: '10', label: '10km' },
    { id: '30', label: '30km' },
    { id: '50', label: '50km' },
    { id: '100', label: '100km' },
    { id: '1000', label: '전체' },
  ]

  const formatDate = (dateString: string | number | Date) => {
    return moment(dateString).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm A')
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
    currentLocationRef.current = { latitude, longitude } // 현재 위치 저장

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

  const addMarkers = async (map: any, data: any[]) => {
    if (clustererRef.current) {
      clustererRef.current.clear()
    }

    const markers = await Promise.all(
      data.map(async (item) => {
        const [lng, lat] = item.locationTag.split(',').map(Number)
        const position = new window.kakao.maps.LatLng(lat, lng)

        const markerImageSrc = await getMarkerImageSrc(
          item.category,
          item.mediaUrls
        )
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
    )

    adjustMarkerPosition(markers)

    markersRef.current = markers
    if (clustererRef.current) {
      clustererRef.current.addMarkers(markers)
    }
  }
  const getMarkerImageSrc = async (category: string, mediaUrls: string[]) => {
    switch (category) {
      case 'PHOTO':
        return mediaUrls && mediaUrls.length > 0
          ? mediaUrls[0]
          : 'https://cdn-icons-png.flaticon.com/128/2536/2536670.png'

      case 'VIDEO':
        if (mediaUrls && mediaUrls.length > 0) {
          const videoUrl = mediaUrls[0]
          return await generateVideoThumbnail(videoUrl)
        } else {
          return 'https://cdn-icons-png.flaticon.com/128/2703/2703920.png'
        }

      case 'MP3':
        return 'https://cdn-icons-png.flaticon.com/128/6527/6527906.png'

      default:
        return 'https://cdn-icons-png.flaticon.com/128/2536/2536670.png'
    }
  }

  const generateVideoThumbnail = (videoUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.src = videoUrl
      video.crossOrigin = 'anonymous' // 필요한 경우 CORS 설정

      video.addEventListener('loadeddata', () => {
        video.currentTime = Math.min(1, video.duration - 1) // 첫 프레임이나 중간 프레임을 선택
      })

      video.addEventListener('seeked', () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const context = canvas.getContext('2d')
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/png'))
        } else {
          reject(new Error('Failed to get canvas context'))
        }
      })

      video.addEventListener('error', (error) => {
        reject(error)
      })
    })
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
         <img alt="게시글 이미지" src='${item.category === 'PHOTO' ? (item.mediaUrls && item.mediaUrls.length > 0 ? item.mediaUrls[0] : '') : 'https://cdn-icons-png.flaticon.com/128/4110/4110234.png'}' onerror="this.onerror=null; this.src='https://cdn-icons-png.flaticon.com/128/4110/4110234.png';">
      </div>
      <div id="main_maker_content">
        <div id="main_maker_name">작성자 : ${item.username}</div> 
      </div>
      <div id="main_maker_content2">
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
    setSelectedPostId(postId)
    setModalOpen(true)
  }

  const zoomIn = () => {
    if (map && currentLocationRef.current) {
      const { latitude, longitude } = currentLocationRef.current
      map.setLevel(map.getLevel() - 1, {
        anchor: new window.kakao.maps.LatLng(latitude, longitude),
      })
    }
  }

  const zoomOut = () => {
    if (map && currentLocationRef.current) {
      const { latitude, longitude } = currentLocationRef.current
      map.setLevel(map.getLevel() + 1, {
        anchor: new window.kakao.maps.LatLng(latitude, longitude),
      })
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
    console.log(data)
    if (data.length > 0 && map) {
      console.log(data)
      addMarkers(map, data)
    }
  }, [data, map])

  useEffect(() => {
    if (isInitialized && client) {
      selectCategory(selectedCategory, selectedDistance)
    }
  }, [isInitialized, client])

  const selectCategory = (category: string, distance: number) => {
    if (client) {
      client.publish({
        destination: '/app/main/category',
        body: JSON.stringify({ category: category, distance: distance }),
      })
      // 카테고리 선택 시 지도의 확대/축소 레벨 고정
      if (map) {
        map.setLevel(mapLevel)
      }
    } else {
      console.error('Not connected to WebSocket')
    }
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    selectCategory(value, selectedDistance)
    console.log(value)
    console.log(selectedDistance)
  }

  const handleDistanceChange = (value: string) => {
    const newDistance = parseInt(value)
    setSelectedDistance(newDistance)
    selectCategory(selectedCategory, newDistance)
    console.log(value)
    console.log(selectedDistance)
  }

  return (
    <div>
      <div
        ref={mapContainer}
        style={{ width: '100%', height: '100vh', position: 'relative' }}
      />
      <div className="custom_zoomcontrol">
        <button onClick={zoomIn}>+</button>
        <button onClick={zoomOut}>-</button>
      </div>

      <div id="category-select">
        <Select
          options={categoryOptions}
          classN="category-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
        />
      </div>

      <div id="distance-select">
        <Select
          options={distanceOptions}
          classN="distance-select"
          value={selectedDistance.toString()}
          onChange={handleDistanceChange}
        />
      </div>

      {selectedPostId !== null && (
        <DetailContentModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          postId={selectedPostId}
          showCloseButton={true}
        />
      )}
    </div>
  )
}

export default MainPage
