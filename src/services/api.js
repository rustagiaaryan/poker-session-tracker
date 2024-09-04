import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response.data.msg || 'An error occurred during login';
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await api.post('/users/register', { username, email, password });
    return response.data;
  } catch (error) {
    throw error.response.data.msg || 'An error occurred during registration';
  }
};

export const getSessions = async () => {
  try {
    const response = await api.get('/sessions');
    return response.data;
  } catch (error) {
    throw error.response.data.msg || 'An error occurred while fetching sessions';
  }
};

export const createSession = async (sessionData) => {
    try {
      const response = await api.post('/sessions', {
        buyIn: sessionData.buyIn,
        startTime: sessionData.startTime,
        // Add any other fields that are available at session start
      });
      console.log('Create session response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in createSession:', error.response?.data || error.message);
      throw error;
    }
  };

export const updateSession = async (sessionId, sessionData) => {
  try {
    const response = await api.put(`/sessions/${sessionId}`, sessionData);
    return response.data;
  } catch (error) {
    throw error.response.data.msg || 'An error occurred while updating the session';
  }
};

export default api;