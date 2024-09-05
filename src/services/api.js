import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

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
    throw error.response?.data?.msg || 'An error occurred during login';
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await api.post('/users/register', { username, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'An error occurred during registration';
  }
};

export const getSessions = async () => {
  try {
    const response = await api.get('/sessions');
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'An error occurred while fetching sessions';
  }
};

export const createSession = async (sessionData) => {
  try {
    const response = await api.post('/sessions', sessionData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'An error occurred while creating the session';
  }
};

export const updateSession = async (sessionId, sessionData) => {
  try {
    const response = await api.put(`/sessions/${sessionId}`, sessionData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'An error occurred while updating the session';
  }
};

export const getFilteredSessions = async (filters) => {
    try {
      const response = await api.get('/sessions/filter', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data?.msg || 'An error occurred while fetching filtered sessions';
    }
  };

export default api;