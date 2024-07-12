import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/map'

export const getMapData = async (): Promise<any> => {
  try {
    const tokenResponse = await axios.get(`${API_BASE_URL}/token`) // 토큰을 받아오는 엔드포인트
    const token = tokenResponse.data.token

    const response = await axios.get(`${API_BASE_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Failed to fetch map data:', error)
    throw new Error('Failed to fetch map data')
  }
}
