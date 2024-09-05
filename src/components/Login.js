import React, { useState } from 'react';
import { login } from '../services/api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      onLogin();
    } catch (error) {
      setError(error.toString());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full max-w-xs p-2 mb-4 bg-gray-800 text-white rounded"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full max-w-xs p-2 mb-4 bg-gray-800 text-white rounded"
        required
      />
      <button type="submit" className="w-full max-w-xs p-2 bg-purple-600 text-white rounded">
        Login
      </button>
    </form>
  );
};

export default Login;