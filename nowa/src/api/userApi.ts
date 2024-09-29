import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_APP_API

interface RegisterPayload {
  loginId: string
  email: string
  password: string
  name: string
  nickname: string
}

export const login = async (payload: { password: string; loginId: string }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/login`, payload)
    return response.data
  } catch (error) {
    throw error
  }
}

export const sendLoginInfo = async (loginId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/follow/loginInfo`, {
      loginId,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const loginWithKakao = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/login/kakao`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const register = async (payload: RegisterPayload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/register`, payload)
    return response.data
  } catch (error) {
    throw error
  }
}

export const findId = async (email: string, authNumber: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/userId`, {
      email,
      authNumber,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const findPassword = async (
  loginId: string,
  email: string,
  authNumber: string
) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/user/password/find`, {
      loginId,
      email,
      authNumber,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const sendVerificationCode = async (
  email: string,
  state: string,
  loginId: string
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mail/send`, {
      email,
      state,
      loginId,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

// 인증 코드 검증
export const verifyCode = async (authNumber: string, email: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/mail/check`, {
      authNumber,
      email,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const resetPassword = async (
  email: string,
  authNumber: string,
  newPassword: string
) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/user/password/find`, {
      email,
      authNumber,
      newPassword,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const uploadProfileImage = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const token = localStorage.getItem('token')
  const response = await axios.put(
    `${API_BASE_URL}/user/profileImage/change`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return response.data
}

export const updatePassword = async (loginId: string, newPassword: string) => {
  const token = localStorage.getItem('token')
  const response = await axios.put(
    `${API_BASE_URL}/user/password/change`,
    {
      loginId,
      password: newPassword,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}

// 아이디 중복확인
export const checkLoginId = async (loginId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/checkLoginId`, {
      loginId,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

// 전체 회원 조회
export const getAllUsers = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

// 친구 추가
export const addFollow = async (token: string, nickname: string) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/follow/add`,
      { nickname },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  } catch (error) {
    throw error
  }
}
