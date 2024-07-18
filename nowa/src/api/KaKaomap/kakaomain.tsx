import React, { useEffect, useRef } from 'react'

declare global {
  interface Window {
    kakao: any
  }
}

const MainPage: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null)

  const initializeMap = (latitude: number, longitude: number) => {
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=2e253b59d2cc8f52b94e061355413a9e&autoload=false`
    script.onload = () => {
      window.kakao.maps.load(() => {
        const mapOption = {
          center: new window.kakao.maps.LatLng(latitude, longitude),
          level: 3,
        }

        const map = new window.kakao.maps.Map(mapContainer.current, mapOption)

        new window.kakao.maps.Marker({
          map,
          position: new window.kakao.maps.LatLng(latitude, longitude),
        })
      })
    }
    document.head.appendChild(script)
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          initializeMap(latitude, longitude)
        },
        (error) => {
          console.error('Error getting geolocation:', error)
        },
        {
          enableHighAccuracy: true, // 높은 정확도 설정
          timeout: 5000, // 타임아웃 설정
          maximumAge: 0, // 캐시된 위치 정보 사용 안함
        }
      )
    } else {
      console.error('Geolocation not supported')
    }
  }, [])

  return (
    <div>
      <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />
    </div>
  )
}

export default MainPage
