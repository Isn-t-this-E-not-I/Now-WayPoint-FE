import axios from 'axios'

const API_URL = 'http://15.165.236.244:8080/api'

export interface Post {
  id: number
  content: string
  hashtags: string[]
  locationTag: string
  category: string
  mediaUrl: string
  username: string
  createdAt: string
  likeCount: number
}

const getCookieValue = (name: string): string | null => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null
  return null
}

const getPostById = async (postId: number): Promise<Post> => {
  // const token = getCookieValue('Authorization')
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Authorization token not found')
  }

  try {
    const response = await axios.get(`${API_URL}/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error fetching the post data:', error)
    throw error
  }
}

export { getPostById }
