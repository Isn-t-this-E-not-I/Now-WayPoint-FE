import axios from 'axios'

const API_URL = import.meta.env.VITE_APP_API

export interface User {
  id: number
  nickname: string
  profileImageUrl: string
}

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
  viewCount: number // 조회수
  isBookmarked: boolean // 북마크 상태
}

const getPostById = async (postId: number): Promise<Post> => {
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

const getLikeListUsers = async (postId: Number): Promise<User[]> => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Authorization token not found')
  }

  try {
    const response = await axios.get(`${API_URL}/posts/${postId}/likes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error fetching liked users:', error)
    throw error
  }
}

export { getPostById, deletePostById, likePostById, getLikeListUsers }
