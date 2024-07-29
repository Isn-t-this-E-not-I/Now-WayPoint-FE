import axios from 'axios'

const API_BASE_URL = 'https://15.165.236.244:8080/api'

const getCookieValue = (name: string): string | null => {
  const value = `; ${document.cookie}`
  console.log(document.cookie)
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null
  return null
}

export const getKakaoApiData = async (address: string): Promise<any> => {
  const token = localStorage.getItem('token')
  // const token = getCookieValue('Authorization')
  console.log(token)
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
