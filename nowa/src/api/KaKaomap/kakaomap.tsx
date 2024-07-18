import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

const getCookieValue = (name: string): string | null => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null
  return null
}

export const getLocationData = async (
  latitude: number,
  longitude: number
): Promise<any> => {
  const token = getCookieValue('Authorization')

  if (!token) {
    throw new Error('Authorization token not found')
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/location`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { latitude, longitude },
    })
    return response.data
  } catch (error) {
    console.error('Failed to fetch location data:', error)
    throw new Error('Failed to fetch location data')
  }
}
