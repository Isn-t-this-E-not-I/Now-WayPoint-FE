import axios from 'axios';

const API_BASE_URL = 'http://15.165.236.244:8080/api';
// const API_BASE_URL = process.env.REACT_APP_API_URL; 

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
    loginId: string;
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

export const register = async (payload: { loginId: string; email: string; password: string; name: string; nickname: string }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/register`, payload);
      return response.data; // 응답 데이터 반환
    } catch (error) {
      throw error;
    }
  };

  export const findId = async (nickname: string, email: string) => { 
    try {
      const response = await axios.post(`${API_BASE_URL}/user/userId`, { nickname, email });  // 백 경로 확인
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  export const findPassword = async (loginId: string, email: string ) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/password/find`, { loginId, email });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  export const sendVerificationCode_Id = async (email: string, state: '아이디찾기') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/mail/send`, { email, state });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  export const sendVerificationCode_Password = async (email: string, state: '비밀번호찾기') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/mail/send`, { email, state });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  export const sendVerificationCode_Register = async (email: string, state: '회원가입') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/mail/send`, { email, state });
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  

  export const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/user/find/password`, {
        email,
        code,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };