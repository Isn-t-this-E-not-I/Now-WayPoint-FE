import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/user'; // 서버 URL

interface LoginPayload {
  email: string;
  password: string;
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
