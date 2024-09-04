import './App.css';
import React, { useState, useEffect } from 'react';
import { Settings, Award, Home, PlusCircle, BarChart2, User } from 'lucide-react';
import { getSessions, createSession, updateSession } from './services/api';
import Login from './components/Login';
import Register from './components/Register';
import SessionHistory from './components/SessionHistory';
import ActiveSession from './components/ActiveSession';

const App = () => {
  const [screen, setScreen] = useState('home');
  const [buyIn, setBuyIn] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchSessions();
    }
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await getSessions();
      setSessions(response);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    }
  };

  const startLiveSession = async () => {
    if (buyIn && !isNaN(buyIn)) {
      const newSession = { 
        buyIn: parseFloat(buyIn),
        startTime: new Date().toISOString(),
        // Add any other fields that are available at session start
      };
      try {
        console.log('Attempting to create session with:', newSession);
        const response = await createSession(newSession);
        console.log('Session created:', response);
        setActiveSession(response);
        setScreen('activeSession');
        setBuyIn('');
      } catch (error) {
        console.error('Failed to start session', error);
        alert(`Failed to start session. Error: ${error.response?.data?.message || error.message}`);
      }
    } else {
      alert('Please enter a valid buy-in amount');
    }
  };

  const handleUpdateSession = async (updatedSessionData) => {
    try {
      const updatedSession = await updateSession(activeSession._id, updatedSessionData);
      setActiveSession(updatedSession);
    } catch (error) {
      console.error('Failed to update session', error);
      alert('Failed to update session. Please try again.');
    }
  };

  const handleEndSession = async (cashOut) => {
    try {
      const endedSession = {
        ...activeSession,
        cashOut: parseFloat(cashOut),
        endTime: new Date().toISOString(),
      };
      await updateSession(activeSession._id, endedSession);
      setActiveSession(null);
      setScreen('home');
      fetchSessions();
    } catch (error) {
      console.error('Failed to end session', error);
      alert('Failed to end session. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setScreen('home');
    setActiveSession(null);
    setSessions([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4">
        <Settings className="text-gray-400 w-6 h-6" />
        <Award className="text-purple-500 w-6 h-6" />
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 overflow-y-auto">
        {!isAuthenticated ? (
          <>
            <h1 className="text-5xl font-bold text-purple-500 mb-8">FLOP</h1>
            <Login onLogin={() => setIsAuthenticated(true)} />
            <Register onRegister={() => setIsAuthenticated(true)} />
          </>
        ) : (
          <>
            {screen === 'home' && (
              <>
                <h1 className="text-5xl font-bold text-purple-500 mb-8">FLOP</h1>
                <h2 className="text-2xl mb-6">Start a Session</h2>
                <input
                  type="number"
                  value={buyIn}
                  onChange={(e) => setBuyIn(e.target.value)}
                  placeholder="Enter Buy In Amount"
                  className="w-full max-w-xs p-3 mb-6 bg-gray-800 text-white rounded-lg text-center text-xl"
                />
                <button 
                  className="w-full max-w-xs p-3 mb-4 bg-purple-600 text-white rounded-lg text-xl"
                  onClick={startLiveSession}
                >
                  Start a Live Session
                </button>
                <button 
                  className="w-full max-w-xs p-3 mb-4 bg-purple-600 text-white rounded-lg text-xl"
                  onClick={() => setScreen('history')}
                >
                  View Session History
                </button>
                <button className="w-full max-w-xs p-3 mb-4 bg-purple-600 text-white rounded-lg text-xl" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
            {screen === 'activeSession' && activeSession && (
              <ActiveSession
                session={activeSession}
                onEndSession={handleEndSession}
                onUpdateSession={handleUpdateSession}
              />
            )}
            {screen === 'history' && (
              <SessionHistory sessions={sessions} />
            )}
          </>
        )}
      </main>

      <footer className="flex justify-around items-center p-4 bg-gray-800">
        <Home className="text-gray-400 w-6 h-6" onClick={() => setScreen('home')} />
        <PlusCircle className="text-gray-400 w-6 h-6" onClick={() => setScreen('home')} />
        <BarChart2 className="text-gray-400 w-6 h-6" onClick={() => setScreen('history')} />
        <User className="text-gray-400 w-6 h-6" />
      </footer>
    </div>
  );
};

export default App;