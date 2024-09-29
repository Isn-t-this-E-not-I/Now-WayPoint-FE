import React, { useRef, useEffect, useState } from 'react'
import { getKakaoApiData } from '../../services/kakaomap'
// import { useLocation } from 'react-router-dom'
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
  // const location = useLocation()
  const [, setToken] = useState(localStorage.getItem('token'))
  const [, setNickname] = useState(localStorage.getItem('nickname'))
  const [, setLocate] = useState('')
  const [data, setData] = useState<any[]>([])
  const [map, setMap] = useState<any>(null)
  const [mapLevel, setMapLevel] = useState<number>(7)
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedDistance, setSelectedDistance] = useState<number>(30)
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const markersRef = useRef<any[]>([])
  const clustererRef = useRef<any>(null)
  const { client, selectContents } = useWebSocket()
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
    currentLocationRef.current = { latitude, longitude }

    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=7428359e58a3e7f2291b25f32cd32b95&libraries=services,clusterer&autoload=false`
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
          const currentLevel = map.getLevel()
          setMapLevel(currentLevel)
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

  const addMarkers = async (_map: any, data: any[]) => {
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

          const imgElement = markerContent.querySelector('img')
          if (imgElement) {
            imgElement.addEventListener('click', () => {
              handleMarkerClick(item.id)
            })
          }

          const marker = new window.kakao.maps.CustomOverlay({
            position: position,
            content: markerContent,
            yAnchor: 1,
          })

          markersRef.current.push(marker)
          return marker
        } catch (error) {
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
          } catch (error) {}
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
      selectCategory(selectedCategory, selectedDistance)
    }
  }, [isInitialized, client, selectedCategory, selectedDistance])

  useEffect(() => {
    if (map) {
      setData(selectContents)
    }
  }, [selectContents, map])

  useEffect(() => {
    if (map && data.length >= 0) {
      addMarkers(map, data)
    }
  }, [data, map])

  const selectCategory = (category: string, distance: number) => {
    if (client) {
      setData([])
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []
      if (clustererRef.current) {
        clustererRef.current.clear()
      }

      client.publish({
        destination: '/app/main/category',
        body: JSON.stringify({ category: category, distance: distance }),
      })

      if (map && currentLocationRef.current) {
        const { latitude, longitude } = currentLocationRef.current
        map.setLevel(mapLevel, {
          anchor: new window.kakao.maps.LatLng(latitude, longitude),
        })
      }
    } else {
      console.error('웹소켓 끊어졌어요')
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
    let newMapLevel = 7
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

      <div id="main_select_box">
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
