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
  removeMedia?: string[]
}

export const getPostById = async (postId: number): Promise<Post> => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('인증 토큰을 찾을 수 없습니다')
  }

  try {
    const response = await axios.get(`${API_URL}/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error) {
    console.error('게시물 데이터를 가져오는 중 오류가 발생했습니다:', error)
    throw error
  }
}

export const deletePostById = async (postId: number): Promise<void> => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('인증 토큰을 찾을 수 없습니다')
  }

  try {
    await axios.delete(`${API_URL}/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error) {
    console.error('게시물을 삭제하는 중 오류가 발생했습니다:', error)
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
  removeMedia: string[]
): Promise<{ success: boolean }> => {
  if (!token) {
    throw new Error('인증 토큰을 찾을 수 없습니다')
  }

  try {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))

    const postRequest = {
      content: content,
      hashtags: tags,
      category: category,
      removeMedia: removeMedia,
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
    console.error('콘텐츠를 업데이트하는 중 오류가 발생했습니다:', error)
    throw error
  }
}
