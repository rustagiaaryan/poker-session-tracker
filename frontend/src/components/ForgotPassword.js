import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await forgotPassword(email);
      setMessage(response.msg);
      setError('');
    } catch (error) {
      setError(error.response?.data?.msg || 'An error occurred. Please try again.');
      setMessage('');
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-5xl font-bold text-purple-500 mb-8 text-center">Poker Session Tracker</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl mb-4 text-center">Forgot Password</h2>
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <p className="font-bold">Password Reset Email Sent</p>
            <p>{message}</p>
            <p className="mt-2">Please check both your inbox and spam folder. The email is sent from rustagiaaryan@gmail.com.</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Send Reset Link
          </button>
          <button
            className="inline-block align-baseline font-bold text-sm text-purple-500 hover:text-purple-800"
            onClick={() => navigate('/login')}
            type="button"
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;