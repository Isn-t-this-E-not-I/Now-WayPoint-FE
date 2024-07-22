import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const getCookieValue = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null;
  return null;
}

export const getKakaoApiData = async (address: string): Promise<any> => {
  const token = getCookieValue('Authorization');
  if (!token) {
    throw new Error('Authorization token not found');
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/map`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: { address }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch map data:', error);
    throw new Error('Failed to fetch map data');
  }
};

export const extractCoordinates = async (payload: any): Promise<any> => {
  const token = getCookieValue('Authorization');
  if (!token) {
    throw new Error('Authorization token not found');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/maintest`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to extract coordinates:', error);
    throw new Error('Failed to extract coordinates');
  }
};
