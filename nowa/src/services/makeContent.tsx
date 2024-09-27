export const uploadContent = async (
  files: File[],
  content: string,
  tags: string[],
  selectedOption: string,
  token: string | null
) => {
  const API_BASE_URL = import.meta.env.VITE_APP_API
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
  // for (let [key, value] of formData.entries()) {
  // }

  try {
    const result = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
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
