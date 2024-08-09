import axios from 'axios'

const API_URL = import.meta.env.VITE_APP_API

export interface Comment {
  id: number
  profileImageUrl: string
  nickname: string
  content: string
  createdAt: string
  likeCount: number
  likedByUser: boolean
  parentId: number | null
  children?: Comment[]
}

export interface User {
  id: number
  nickname: string
  profileImageUrl: string
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
): Promise<void | string> => {
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
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      const result = '댓글을 삭제할 권한이 없습니다.'
      return result
    } else {
      console.error('Error deleting comment:', error)
      throw new Error('댓글을 삭제하는 중 오류가 발생했습니다.')
    }
  }
}

const createComment = async (
  postId: number,
  content: string,
  parentId: number | null = null
): Promise<Comment> => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Authorization token not found')
  }

  try {
    const response = await axios.post(
      `${API_URL}/posts/${postId}/comments`,
      { content, parentId },
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

const toggleCommentLike = async (
  postId: number,
  commentId: number
): Promise<void> => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Authorization token not found')
  }

  try {
    await axios.post( 
      `${API_URL}/posts/${postId}/comments/${commentId}/like`,
      {postId : postId},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error liking/unliking the comment:', error)
    throw error
  }
}

const getAllUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Authorization token not found')
  }

  try {
    const response = await axios.get(`${API_URL}/user/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching all users:', error)
    throw error
  }
}

export {
  getCommentsByPostId,
  deleteCommentById,
  createComment,
  toggleCommentLike,
  getAllUsers,
}
