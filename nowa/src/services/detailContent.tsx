import axios from 'axios'

const API_URL = import.meta.env.VITE_APP_API

export interface Post {
  id: number
  content: string
  hashtags: string[]
  locationTag: string
  category: string
  mediaUrls: string[]
  nickname: string
  createdAt: string
  likeCount: number
  profileImageUrl: string
  likedByUser: boolean
}

const getCookieValue = (name: number): string | null => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null
  return null
}

const getPostById = async (postId: number): Promise<Post> => {
  const token = localStorage.getItem('token')

  console.log(postId)
  if (!token) {
    throw new Error('Authorization token not found')
  }

  try {
    const response = await axios.get(`${API_URL}/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log(response.data.hashtags)
    return response.data
  } catch (error) {
    console.error('Error fetching the post data:', error)
    throw error
  }
}

const deletePostById = async (postId: number): Promise<void> => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Authorization token not found')
  }

  try {
    await axios.delete(`${API_URL}/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error) {
    console.error('Error deleting the post:', error)
    throw error
  }
}

const likePostById = async (postId: number): Promise<void> => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Authorization token not found')
  }

  try {
    await axios.post(
      `${API_URL}/posts/${postId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
  } catch (error) {
    console.error('Error liking the post:', error)
    throw error
  }
}

export { getPostById, deletePostById, likePostById }
