import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api/map'

export const getMapData = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}`)
    return response.data
  } catch (error) {
    console.error('왜 실패한거지:', error)
    throw new Error('Failed to fetch map data')
    /** 테스트중 */
  }

  
}
