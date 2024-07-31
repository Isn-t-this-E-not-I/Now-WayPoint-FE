import axios from 'axios'

const KAKAO_API_URL = 'https://dapi.kakao.com/v2/local/geo/coord2address.json'
const KAKAO_API_KEY = import.meta.env.VITE_APP_REST_KEY

const getShortAddress = (address: string): string => {
  const parts = address.split(' ')
  return parts.slice(0, 3).join(' ')
}

export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    const response = await axios.get(KAKAO_API_URL, {
      params: {
        x: longitude,
        y: latitude,
      },
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
    })

    const address =
      response.data.documents[0]?.address?.address_name ||
      '주소를 찾을 수 없습니다'
    return getShortAddress(address)
  } catch (error) {
    console.error('Error fetching address from coordinates:', error)
    throw error
  }
}
