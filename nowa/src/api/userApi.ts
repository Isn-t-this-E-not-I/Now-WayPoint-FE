import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
// const API_BASE_URL = process.env.REACT_APP_API_URL; 

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

export const login = async (payload: { password: string; loginId: string }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/login`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginWithKakao = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/login/kakao`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (payload: { password: string; loginId: string; name: string; nickname: string }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/register`, payload);
      return response.data; // 응답 데이터 반환
    } catch (error) {
      throw error;
    }
  };

  export const findIdByNickname = async (nickname: string) => { // 아이디 찾기
    try {
      const response = await axios.post(`${API_BASE_URL}/user/userId`, { nickname });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  export const findPasswordByEmail = async (email: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/find/password`, { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  export const resetPassword = async (loginId: string, password: string) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/user/find/password`, {
        loginId,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };