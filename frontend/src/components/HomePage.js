import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Play, DollarSign, Clock } from 'lucide-react';
import { getSessions, createSession } from '../services/api';
import Toast from './Toast';

const HomePage = () => {
  const navigate = useNavigate();
  const [buyIn, setBuyIn] = useState('');
  const [activeSessions, setActiveSessions] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const sessions = await getSessions('/active');
      setActiveSessions(sessions);
    } catch (error) {
      console.error('Failed to fetch active sessions', error);
    }
  };

  const handleStartLiveSession = async () => {
    if (buyIn && !isNaN(buyIn)) {
      const newSession = { 
        buyIn: parseFloat(buyIn),
        startTime: new Date().toISOString(),
        isActive: true
      };
      try {
        const response = await createSession(newSession);
        navigate('/active-session', { state: { sessionId: response._id } });
      } catch (error) {
        console.error('Failed to start session', error);
        setToastMessage(`Failed to start session. Error: ${error.response?.data?.message || error.message}`);
      }
    } else {
      setToastMessage('Please enter a valid buy-in amount');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-5xl font-bold text-purple-500 mb-8 text-center">FLOP</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl mb-4 text-center">Start a Session</h2>
        <div className="flex items-center mb-4">
          <input
            type="number"
            value={buyIn}
            onChange={(e) => setBuyIn(e.target.value)}
            placeholder="Enter Buy In Amount"
            className="flex-grow p-3 bg-gray-700 text-white rounded-l-lg text-center text-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button 
            className="bg-purple-600 text-white p-3 rounded-r-lg text-xl hover:bg-purple-700 transition duration-300 flex items-center"
            onClick={handleStartLiveSession}
          >
            <PlusCircle className="mr-2" />
            Start
          </button>
        </div>
      </div>
      
      {activeSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl mb-4 text-center">Active Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSessions.map(session => (
              <div
                key={session._id}
                className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition duration-300"
                onClick={() => navigate('/active-session', { state: { sessionId: session._id } })}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold">${session.buyIn} Buy-in</span>
                  <Play className="text-purple-500" />
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span className="flex items-center"><DollarSign size={14} className="mr-1" />{session.gameType}</span>
                  <span className="flex items-center"><Clock size={14} className="mr-1" />{new Date(session.startTime).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          className="w-full p-3 bg-purple-600 text-white rounded-lg text-xl hover:bg-purple-700 transition duration-300"
          onClick={() => navigate('/add-completed')}
        >
          Add Completed Session
        </button>
        <button 
          className="w-full p-3 bg-purple-600 text-white rounded-lg text-xl hover:bg-purple-700 transition duration-300"
          onClick={() => navigate('/history')}
        >
          View Session History
        </button>
      </div>

      {toastMessage && (
        <Toast 
          message={toastMessage} 
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  );
};

export default HomePage;