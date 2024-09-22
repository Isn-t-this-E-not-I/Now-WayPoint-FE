import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_APP_API

export const getKakaoApiData = async (address: string): Promise<any> => {
  const token = localStorage.getItem('token')
  // const token = getCookieValue('Authorization')
  if (!token) {
    throw new Error('Authorization token not found')
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/map`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { address },
    })
    return response.data
  } catch (error) {
    console.error('Failed to fetch map data:', error)
    throw new Error('Failed to fetch map data')
  }
}
