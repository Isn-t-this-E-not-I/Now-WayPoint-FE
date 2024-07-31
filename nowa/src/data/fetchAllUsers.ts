import axios from 'axios';

const fetchAllUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${import.meta.env.VITE_APP_API}/user/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all users:', error);
    return [];
  }
};

export default fetchAllUsers;