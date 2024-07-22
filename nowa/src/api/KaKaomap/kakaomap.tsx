import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const getKakaoApiData = async (address: string): Promise<any> => {
  const tooken =   document.cookie.split('=')[1]

  try {
    const response = await axios.get(`${API_BASE_URL}/map`, {
      headers: {
        'Authorization': 'Bearer ' + tooken
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
  try {
    const response = await axios.post(`${API_BASE_URL}/maintest`, payload);
    return response.data;
  } catch (error) {
    console.error('Failed to extract coordinates:', error);
    throw new Error('Failed to extract coordinates');
  }
};
