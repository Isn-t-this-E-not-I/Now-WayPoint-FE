import React, { useRef, useState } from 'react'
import { getKakaoApiData, extractCoordinates } from '@/api/KaKaomap/kakaomap'

declare global {
  interface Window {
    kakao: any
  }
}

const MainPage: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [address, setAddress] = useState('')

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

  const handleSearch = async () => {
    try {
      const mapData = await getKakaoApiData(address)
      const coordinates = await extractCoordinates(mapData)

      const latitude = parseFloat(coordinates.latitude)
      const longitude = parseFloat(coordinates.longitude)

      initializeMap(latitude, longitude)
    } catch (error) {
      console.error('Failed to initialize map:', error)
    }
  }

  return (
    <div>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter address"
      />
      <button onClick={handleSearch}>Search</button>
      <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />
    </div>
  )
}

export default MainPage
