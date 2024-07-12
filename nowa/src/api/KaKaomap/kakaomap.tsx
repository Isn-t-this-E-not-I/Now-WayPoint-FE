import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

export const getMapData = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/경로`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch map data:', error)
    throw new Error('Failed to fetch map data')
  }
}
