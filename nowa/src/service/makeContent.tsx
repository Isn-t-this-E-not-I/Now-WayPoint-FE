// export const uploadContent = async (
//   files: File[],
//   content: string,
//   tags: string[],
//   selectedOption: string,
//   token: string | null
// ) => {
//   const formData = new FormData()
//   files.forEach((file, index) => {
//     formData.append(`file${index}`, file)
//   })
//   formData.append('content', content)
//   formData.append('tags', JSON.stringify(tags))
//   formData.append('type', selectedOption)

import { Navigate } from 'react-router-dom'

//   try {
//     const response = await fetch('/api/posts', {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: formData,
//     })
//     if (!response.ok) {
//       throw new Error('Failed to upload')
//     }
//     const result = await response.json()
//     return result
//   } catch (error) {
//     console.error('Error uploading content:', error)
//     throw error
//   }
// }

// src/service/makeContent.tsx
// src/service/makeContent.tsx
export const uploadContent = async (
  files: File[],
  content: string,
  tags: string[],
  selectedOption: string,
  token: string | null
) => {
  const API_BASE_URL = 'http://15.165.236.244:8080/api'
  const formData = new FormData()

  files.forEach((file) => {
    formData.append('files', file)
  })

  // JSON 데이터를 문자열로 변환하지 않고 직접 추가
  const postRequest = {
    content: content,
    hashtags: tags,
    category: selectedOption,
  }

  formData.append(
    'data',
    new Blob([JSON.stringify(postRequest)], { type: 'application/json' })
  )

  // FormData의 내용을 확인하는 코드
  for (let [key, value] of formData.entries()) {
    console.log(key, value)
  }

  try {
    const result = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // 'Content-Type': 'multipart/form-data', // 이 부분은 설정하지 않아야 함
      },
      body: formData,
    })
    const response = await result.json()

    return response
  } catch (error) {
    console.error('Error uploading content:', error)
    throw error
  }
}
