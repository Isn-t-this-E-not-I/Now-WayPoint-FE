import axios from 'axios'

const API_URL = import.meta.env.VITE_APP_API

export interface Post {
  id: number
  content: string
  hashtags?: string[]
  locationTag?: string
  category: string
  mediaUrls?: string[]
  nickname: string
  createdAt: string
  likeCount: number
}

export const getPostById = async (postId: number): Promise<Post> => {
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

export const deletePostById = async (postId: number): Promise<void> => {
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

export const updateContent = async (
  id: number,
  files: File[],
  content: string,
  tags: string[],
  category: string,
  token: string | null,
  deletedUrls: string[]
): Promise<{ success: boolean }> => {
  if (!token) {
    throw new Error('Authorization token not found')
  }

  try {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))

    const postRequest = {
      content: content,
      hashtags: tags,
      category: category,
    }

    formData.append(
      'data',
      new Blob([JSON.stringify(postRequest)], { type: 'application/json' })
    )

    const response = await axios.put(`${API_URL}/posts/${id}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })

    return { success: response.status === 200 }
  } catch (error) {
    console.error('Error updating content:', error)
    throw error
  }
}
