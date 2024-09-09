import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://poker-tracker-backend.onrender.com/api';

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

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/users/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'An error occurred while sending reset password email';
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await api.post(`/users/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'An error occurred while resetting password';
  }
};

export const getSessions = async (endpoint = '') => {
  try {
    const response = await api.get(`/sessions${endpoint}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'An error occurred while fetching sessions';
  }
};

export const getSession = async (sessionId) => {
  try {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'An error occurred while fetching the session';
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

export const deleteSession = async (sessionId) => {
  try {
    const response = await api.delete(`/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'An error occurred while deleting the session';
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

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/users/change-password', { currentPassword, newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'An error occurred while changing password';
  }
};

export const deleteAccount = async () => {
  try {
    const response = await api.delete('/users/delete-account');
    return response.data;
  } catch (error) {
    throw error.response?.data?.msg || 'An error occurred while deleting the account';
  }
};

export default api;