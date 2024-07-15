import React, { useEffect, useRef } from 'react'
// import { getMapData } from '@/api/KaKaomap/kakaomap'

declare global {
  interface Window {
    kakao: any
  }
}

const MainPage: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initializeMap = async () => {
      try {
        // const mapData = await getMapData() // 백엔드 데이터 사용 부분 주석 처리

        // 임의의 위도와 경도 사용
        const mapData = {
          latitude: 37.5665,
          longitude: 126.978,
        }

        // 카카오맵 API 스크립트 로드
        const script = document.createElement('script')
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=2e253b59d2cc8f52b94e061355413a9e&autoload=false`
        script.onload = () => {
          window.kakao.maps.load(() => {
            const mapOption = {
              center: new window.kakao.maps.LatLng(
                mapData.latitude,
                mapData.longitude
              ),
              level: 3,
            }

            const map = new window.kakao.maps.Map(
              mapContainer.current,
              mapOption
            )

            // 필요한 경우 마커 추가
            new window.kakao.maps.Marker({
              map,
              position: new window.kakao.maps.LatLng(
                mapData.latitude,
                mapData.longitude
              ),
            })
          })
        }
        document.head.appendChild(script)
      } catch (error) {
        console.error('Failed to initialize map:', error)
      }
    }

    initializeMap()
  }, [])

  return <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />
}

export default MainPage
