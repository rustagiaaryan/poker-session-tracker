import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleCallback = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (token) {
      localStorage.setItem('token', token);
      onLogin();
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [location, navigate, onLogin]);

  return <div>Processing Google login...</div>;
};

export default GoogleCallback;