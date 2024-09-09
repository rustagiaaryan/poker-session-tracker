import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { useGoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      onLogin();
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      window.location.href = 'https://poker-tracker-backend.onrender.com/api/auth/google';
    },
    flow: 'auth-code',
  });

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="w-full max-w-md">
        <h1 className="text-5xl font-bold text-purple-500 mb-8 text-center">Poker Session Tracker</h1>
        <form onSubmit={handleSubmit} className="bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl mb-4 text-center">Login</h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
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
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <button
              className={`bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
            <div className="flex flex-col items-end">
              <button
                className="inline-block align-baseline font-bold text-sm text-purple-500 hover:text-purple-800"
                onClick={() => navigate('/register')}
                type="button"
              >
                Register
              </button>
              <Link
                to="/forgot-password"
                className="inline-block align-baseline font-bold text-sm text-purple-500 hover:text-purple-800 mt-2"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-500">Or</span>
            </div>
          </div>
          <button
            onClick={() => googleLogin()}
            type="button"
            className="w-full mt-4 py-2 px-4 border flex justify-center items-center bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-md transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0)">
                <path d="M20.3081 10.2303C20.3081 9.55056 20.253 8.86711 20.1354 8.19836H10.7031V12.0492H16.1046C15.8804 13.2911 15.1602 14.3898 14.1057 15.0879V17.5866H17.3282C19.2205 15.8449 20.3081 13.2728 20.3081 10.2303Z" fill="#3F83F8"/>
                <path d="M10.7019 20.0006C13.3989 20.0006 15.6734 19.1151 17.3306 17.5865L14.1081 15.0879C13.2115 15.6979 12.0541 16.0433 10.7056 16.0433C8.09669 16.0433 5.88468 14.2832 5.091 11.9169H1.76562V14.4927C3.46322 17.8695 6.92087 20.0006 10.7019 20.0006V20.0006Z" fill="#34A853"/>
                <path d="M5.08857 11.9169C4.66969 10.6749 4.66969 9.33008 5.08857 8.08811V5.51233H1.76688C0.348541 8.33798 0.348541 11.667 1.76688 14.4927L5.08857 11.9169V11.9169Z" fill="#FBBC04"/>
                <path d="M10.7019 3.95805C12.1276 3.936 13.5055 4.47247 14.538 5.45722L17.393 2.60218C15.5852 0.904587 13.1858 -0.0287217 10.7019 0.000673888C6.92087 0.000673888 3.46322 2.13185 1.76562 5.51234L5.08732 8.08813C5.87733 5.71811 8.09302 3.95805 10.7019 3.95805V3.95805Z" fill="#EA4335"/>
              </g>
              <defs>
                <clipPath id="clip0">
                  <rect width="20" height="20" fill="white"/>
                </clipPath>
              </defs>
            </svg>
            Sign in with Google
          </button>
        </form>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;