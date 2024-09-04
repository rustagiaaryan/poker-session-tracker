import React, { useState } from 'react';
import { register } from '../services/api';

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await register(username, email, password);
      localStorage.setItem('token', data.token);
      onRegister();
    } catch (error) {
      setError(error.toString());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="w-full max-w-xs p-2 mb-4 bg-gray-800 text-white rounded"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full max-w-xs p-2 mb-4 bg-gray-800 text-white rounded"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full max-w-xs p-2 mb-4 bg-gray-800 text-white rounded"
      />
      <button type="submit" className="w-full max-w-xs p-2 bg-purple-600 text-white rounded">
        Register
      </button>
    </form>
  );
};

export default Register;