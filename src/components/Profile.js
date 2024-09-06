import React from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  // You can add more profile options and functionality here
  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-purple-500 mb-8 text-center">Profile</h1>
      <div className="bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <p className="mb-4">User profile options will be available here.</p>
        <button
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Profile;