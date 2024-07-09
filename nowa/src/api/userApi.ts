import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/user'; // 서버 URL

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
    email: string;
    password: string;
    name: string;
    nickname: string;
  }

export const login = async (payload: LoginPayload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginWithKakao = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/login/kakao`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (payload: RegisterPayload) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, payload);
      return response.data; // 응답 데이터 반환
    } catch (error) {
      throw error;
    }
  };