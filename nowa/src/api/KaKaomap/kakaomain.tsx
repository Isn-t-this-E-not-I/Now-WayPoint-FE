import React, { useRef, useEffect, useState } from 'react'
import { getKakaoApiData } from '../../services/kakaomap'
import { useLocation } from 'react-router-dom'
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
            const level = map.getLevel() - 3
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

  // 상대적인 시간 형식으로 변환하는 함수
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date().getTime()
    const time = new Date(timestamp).getTime()
    const diff = now - time

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) {
      return `${days}일 전`
    } else if (hours > 0) {
      return `${hours}시간 전`
    } else if (minutes > 0) {
      return `${minutes}분 전`
    } else {
      return '방금 전'
    }
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
    // 기존 마커 삭제
    if (clustererRef.current) {
      clustererRef.current.clear()
    }

    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    const markers = await Promise.all(
      data.map(async (item) => {
        const [lng, lat] = item.locationTag.split(',').map(Number)
        const position = new window.kakao.maps.LatLng(lat, lng)

        try {
          const markerImageSrc = getMarkerImageSrc(
            item.category,
            item.mediaUrls
          )

          const markerContent = document.createElement('div')
          markerContent.className = 'marker-with-pin'
          markerContent.innerHTML = `<img src="${markerImageSrc}" alt="marker">`

          // 이미지 요소가 존재하는지 확인하고 클릭 이벤트 추가
          const imgElement = markerContent.querySelector('img')
          if (imgElement) {
            imgElement.addEventListener('click', () => {
              handleMarkerClick(item.id)
            })
          } else {
            console.warn('Marker image element not found')
          }

          // CustomOverlay를 생성합니다.
          const marker = new window.kakao.maps.CustomOverlay({
            position: position,
            content: markerContent,
            yAnchor: 1,
          })

          markersRef.current.push(marker)
          return marker
        } catch (error) {
          console.error('Error creating marker:', error)
          return null
        }
      })
    )

    const validMarkers = markers.filter((marker) => marker !== null)
    adjustMarkerPosition(validMarkers)

    if (clustererRef.current) {
      clustererRef.current.addMarkers(validMarkers)
    }
  }

  const getMarkerImageSrc = (category: string, mediaUrls: string[]) => {
    switch (category) {
      case 'PHOTO':
        return mediaUrls && mediaUrls.length > 0
          ? mediaUrls[0]
          : 'https://cdn-icons-png.flaticon.com/128/2536/2536670.png'
      case 'VIDEO':
        return 'https://cdn-icons-png.flaticon.com/128/2703/2703920.png' // Default video icon
      case 'MP3':
        return 'https://cdn-icons-png.flaticon.com/128/6527/6527906.png'
      default:
        return 'https://cdn-icons-png.flaticon.com/128/2536/2536670.png'
    }
  }

  const displayCustomOverlay = async (
    map: any,
    marker: { getPosition: () => any },
    item: {
      profileImageUrl?: string | any[]
      mediaUrls?: string | any[]
      username?: string
      createdAt?: string
      id?: number
      category?: string
      likeCount?: number
      hashtags?: string[]
      locationTag?: string
      content?: string
    }
  ) => {
    let mediaContent = ''

    if (item.mediaUrls && item.mediaUrls.length > 0) {
      if (item.mediaUrls[0].endsWith('.mp4')) {
        mediaContent = `<video width="320" height="240" class="video-hover" muted>
                          <source src="${item.mediaUrls[0]}" type="video/mp4">
                          Your browser does not support the video tag.
                        </video>`
      } else if (item.mediaUrls[0].endsWith('.mp3')) {
        mediaContent = `<img src="https://cdn-icons-png.flaticon.com/128/6527/6527906.png" alt="audio icon">`
      } else {
        mediaContent = `<img src="${item.mediaUrls[0]}" alt="content image">`
      }
    } else {
      mediaContent = `<img src="https://cdn-icons-png.flaticon.com/128/4110/4110234.png" alt="default icon">`
    }

    const hashtags =
      item.hashtags
        ?.map((tag) => `<span class="main_hashtag">${tag}</span>`)
        .join(' ') || ''

    const content = document.createElement('div')
    content.className = 'overlaybox'
    content.innerHTML = `
      <div class="main_maker_header">
        <div class="main_maker_label">${item.category || 'Unknown'}</div>
        <div class="closeBtn">X</div>
      </div>
      <div id="main_maker_content">
        <div id="main_maker_profile">
          <div><img id="main_profile" alt="프로필" src="${item.profileImageUrl || ''}"></img></div>
          <div id="main_maker_name">${item.username || 'Unknown'}</div>
        </div> 
      </div>
      <div id="main_maker_img">
         ${mediaContent}
      </div>
      <div>
        <div id="main_maker_content_semi">${item.content || ''}</div>
        <div id="main_maker_hashtags">${hashtags}</div>
      </div>
      </div>
      <div id="main_maker_content2">
        <div id="main_maker_like">♥ ${item.likeCount || 0}</div>
        <div id="main_maker_create">${formatRelativeTime(item.createdAt || '')}</div>   
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

    // Video hover 이벤트 추가
    const videoElement = content.querySelector(
      '.video-hover'
    ) as HTMLVideoElement
    if (videoElement) {
      videoElement.addEventListener('mouseenter', () => {
        videoElement.play()
      })
      videoElement.addEventListener('mouseleave', () => {
        videoElement.pause()
      })
    }

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

  const handleMarkerClick = (postId: any) => {
    setSelectedPostId(postId)
    setModalOpen(true)
  }

  const zoomIn = () => {
    if (map && currentLocationRef.current) {
      const { latitude, longitude } = currentLocationRef.current
      map.setLevel(map.getLevel() - 3, {
        anchor: new window.kakao.maps.LatLng(latitude, longitude),
      })
    }
  }

  const zoomOut = () => {
    if (map && currentLocationRef.current) {
      const { latitude, longitude } = currentLocationRef.current
      map.setLevel(map.getLevel() + 3, {
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
            localStorage.setItem('locate', `${longitude},${latitude}`)
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
      const subscription = client.subscribe(
        `/queue/${locate}/${nickname}`,
        (messageOutput: IMessage) => {
          const receivedData = JSON.parse(messageOutput.body)
          setData(receivedData)
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
      if (map && currentLocationRef.current) {
        const { latitude, longitude } = currentLocationRef.current
        map.setLevel(mapLevel, {
          anchor: new window.kakao.maps.LatLng(latitude, longitude),
        })
      }
    } else {
      console.error('Not connected to WebSocket')
    }
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    selectCategory(value, selectedDistance)
  }

  const handleDistanceChange = (value: string) => {
    const newDistance = parseInt(value)
    setSelectedDistance(newDistance)

    // 거리에 따라 mapLevel 설정
    let newMapLevel = 7 // 기본 레벨
    switch (newDistance) {
      case 10:
        newMapLevel = 3
        break
      case 30:
        newMapLevel = 5
        break
      case 50:
        newMapLevel = 8
        break
      case 100:
        newMapLevel = 10
        break
      case 1000:
        newMapLevel = 12
        break
      default:
        newMapLevel = 7
    }
    setMapLevel(newMapLevel)

    selectCategory(selectedCategory, newDistance)

    // 지도 레벨 및 위치 업데이트
    if (map && currentLocationRef.current) {
      const { latitude, longitude } = currentLocationRef.current
      map.setLevel(newMapLevel, {
        anchor: new window.kakao.maps.LatLng(latitude, longitude),
      })
    }
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
