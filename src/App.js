import './App.css';
import React, { useState, useEffect } from 'react';
import { Settings, Award, Home, PlusCircle, BarChart2, User, ChevronLeft, PauseCircle, PlayCircle } from 'lucide-react';
import { getSessions, createSession } from './services/api';
import Login from './components/Login';
import Register from './components/Register';
import SessionHistory from './components/SessionHistory';

const App = () => {
  const [screen, setScreen] = useState('home');
  const [buyIn, setBuyIn] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchSessions();
    }
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const fetchSessions = async () => {
    try {
      const response = await getSessions();
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    }
  };

  const startLiveSession = async () => {
    if (buyIn && !isNaN(buyIn)) {
      const newSession = { 
        buyIn: parseFloat(buyIn), 
        cashOut: 0, // Initialize cashOut to 0
        duration: 0, // Initialize duration to 0
        startTime: new Date().toISOString(),
      };
      try {
        console.log('Attempting to create session with:', newSession);
        const response = await createSession(newSession);
        console.log('Session created:', response);
        setActiveSession(response);
        setScreen('activeSession');
        setIsRunning(true);
        setBuyIn('');
      } catch (error) {
        console.error('Failed to start session', error);
        alert(`Failed to start session. Error: ${error.response?.data?.message || error.message}`);
      }
    } else {
      alert('Please enter a valid buy-in amount');
    }
  };

  const endSession = async () => {
    const cashOut = prompt('Enter your cash out amount:');
    if (cashOut && !isNaN(cashOut)) {
      const endedSession = {
        ...activeSession,
        cashOut: parseFloat(cashOut),
        duration: elapsedTime / 60, // Convert seconds to minutes
      };
      try {
        await createSession(endedSession);
        setActiveSession(null);
        setScreen('home');
        setElapsedTime(0);
        setIsRunning(false);
        fetchSessions();
        alert(`Session ended. Profit: $${(endedSession.cashOut - endedSession.buyIn).toFixed(2)}`);
      } catch (error) {
        console.error('Failed to end session', error);
        alert('Failed to end session. Please try again.');
      }
    } else {
      alert('Please enter a valid cash out amount');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setScreen('home');
    setActiveSession(null);
    setElapsedTime(0);
    setIsRunning(false);
    setSessions([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4">
        {screen === 'activeSession' ? (
          <ChevronLeft className="text-gray-400 w-6 h-6 cursor-pointer" onClick={() => setScreen('home')} />
        ) : (
          <Settings className="text-gray-400 w-6 h-6" />
        )}
        {screen === 'activeSession' && <div className="text-purple-500 text-xl">{formatTime(elapsedTime)}</div>}
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
            {screen === 'activeSession' && (
              <div className="w-full max-w-xs">
                <h2 className="text-2xl mb-6 text-center">Active Session</h2>
                <p className="text-xl mb-4">Buy In: ${activeSession.buyIn}</p>
                <button 
                  className="w-full p-3 mb-4 bg-purple-600 text-white rounded-lg text-xl"
                  onClick={endSession}
                >
                  End Session
                </button>
              </div>
            )}
            {screen === 'history' && (
              <SessionHistory />
            )}
          </>
        )}
      </main>

      <footer className="flex justify-around items-center p-4 bg-gray-800">
        <Home className="text-gray-400 w-6 h-6" onClick={() => setScreen('home')} />
        <PlusCircle className="text-gray-400 w-6 h-6" onClick={() => setScreen('home')} />
        <div className="bg-purple-600 rounded-full p-3" onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? (
            <PauseCircle className="text-white w-6 h-6" />
          ) : (
            <PlayCircle className="text-white w-6 h-6" />
          )}
        </div>
        <BarChart2 className="text-gray-400 w-6 h-6" onClick={() => setScreen('history')} />
        <User className="text-gray-400 w-6 h-6" />
      </footer>
    </div>
  );
};

export default App;