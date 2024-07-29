import axios from 'axios'

const API_URL = import.meta.env.VITE_APP_API

export interface Comment {
  id: number
  profileImageUrl: string
  nickname: string
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
    return response.data.content
  } catch (error) {
    console.error('Error fetching the comments data:', error)
    throw error
  }
}

const deleteCommentById = async (
  postId: number,
  commentId: number
): Promise<void> => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Authorization token not found')
  }

  try {
    await axios.delete(`${API_URL}/posts/${postId}/comments/${commentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error) {
    console.error('Error deleting the comment:', error)
    throw error
  }
}

const createComment = async (postId: number, content: string) => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Authorization token not found')
  }

  try {
    const response = await axios.post(
      `${API_URL}/posts/${postId}/comments`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error('Error creating the comment:', error)
    throw error
  }
}

export { getCommentsByPostId, deleteCommentById, createComment }
