import axios from 'axios'

const API_URL = import.meta.env.VITE_APP_API

export interface Comment {
  id: number
  postId: number
  userId: string
  content: string
  createdAt: string
}

const getCommentsByPostId = async (postId: number): Promise<Comment[]> => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Authorization token not found')
  }

  try {
    const response = await axios.get(`${API_URL}/posts/${postId}/comments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error fetching the comments data:', error)
    throw error
  }
}

export { getCommentsByPostId }
