import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { Settings, Award, Home, PlusCircle, BarChart2, User, LogOut } from 'lucide-react';
import { getSessions, createSession, updateSession } from './services/api';
import Login from './components/Login';
import Register from './components/Register';
import SessionHistory from './components/SessionHistory';
import ActiveSession from './components/ActiveSession';
import AddCompletedSession from './components/AddCompletedSession';
import Profile from './components/Profile';

const App = () => {
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

  const handleUpdateSession = async (sessionId, updatedSessionData) => {
    try {
      const updatedSession = await updateSession(sessionId, updatedSessionData);
      if (activeSession && activeSession._id === sessionId) {
        setActiveSession(updatedSession);
      }
      await fetchSessions();
    } catch (error) {
      console.error('Failed to update session', error);
      alert('Failed to update session. Please try again.');
    }
  };

  const handleEndSession = async (sessionData) => {
    try {
      await updateSession(activeSession._id, sessionData);
      setActiveSession(null);
      await fetchSessions();
    } catch (error) {
      console.error('Failed to end session', error);
      alert('Failed to end session. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setActiveSession(null);
    setSessions([]);
  };

  const handleAddCompletedSession = async (sessionData) => {
    try {
      const newSession = await createSession(sessionData);
      setSessions(prevSessions => [...prevSessions, newSession]);
    } catch (error) {
      console.error('Failed to add completed session', error);
      alert('Failed to add completed session. Please try again.');
    }
  };

  return (
    <Router>
      <div className="flex flex-col h-screen bg-gray-900 text-white">
        <header className="flex justify-between items-center p-4">
          <Settings className="text-gray-400 w-6 h-6" />
          <Award className="text-purple-500 w-6 h-6" />
          {isAuthenticated && (
            <LogOut className="text-gray-400 w-6 h-6 cursor-pointer" onClick={handleLogout} />
          )}
        </header>

        <main className="flex-grow flex flex-col items-center justify-center p-4 overflow-y-auto">
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login onLogin={() => setIsAuthenticated(true)} /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <Register onRegister={() => setIsAuthenticated(true)} /> : <Navigate to="/" />} />
            <Route path="/" element={isAuthenticated ? <HomePage startLiveSession={setActiveSession} /> : <Navigate to="/login" />} />
            <Route path="/history" element={isAuthenticated ? <SessionHistory sessions={sessions} onUpdateSession={handleUpdateSession} fetchSessions={fetchSessions} /> : <Navigate to="/login" />} />
            <Route path="/active-session" element={isAuthenticated && activeSession ? <ActiveSession session={activeSession} onEndSession={handleEndSession} onUpdateSession={(updatedData) => handleUpdateSession(activeSession._id, updatedData)} onDiscardSession={() => setActiveSession(null)} /> : <Navigate to="/" />} />
            <Route path="/add-completed" element={isAuthenticated ? <AddCompletedSession onSessionAdded={handleAddCompletedSession} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          </Routes>
        </main>

        <Footer isAuthenticated={isAuthenticated} />
      </div>
    </Router>
  );
};

const HomePage = ({ startLiveSession }) => {
  const navigate = useNavigate();
  const [buyIn, setBuyIn] = useState('');

  const handleStartLiveSession = async () => {
    if (buyIn && !isNaN(buyIn)) {
      const newSession = { 
        buyIn: parseFloat(buyIn),
        startTime: new Date().toISOString(),
      };
      try {
        const response = await createSession(newSession);
        startLiveSession(response);
        navigate('/active-session');
      } catch (error) {
        console.error('Failed to start session', error);
        alert(`Failed to start session. Error: ${error.response?.data?.message || error.message}`);
      }
    } else {
      alert('Please enter a valid buy-in amount');
    }
  };

  return (
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
        onClick={handleStartLiveSession}
      >
        Start a Live Session
      </button>
      <button 
        className="w-full max-w-xs p-3 mb-4 bg-purple-600 text-white rounded-lg text-xl"
        onClick={() => navigate('/add-completed')}
      >
        Add Completed Session
      </button>
      <button 
        className="w-full max-w-xs p-3 mb-4 bg-purple-600 text-white rounded-lg text-xl"
        onClick={() => navigate('/history')}
      >
        View Session History
      </button>
    </>
  );
};

const Footer = ({ isAuthenticated }) => {
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  return (
    <footer className="flex justify-around items-center p-4 bg-gray-800">
      <Home className="text-gray-400 w-6 h-6 cursor-pointer" onClick={() => navigate('/')} />
      <PlusCircle className="text-gray-400 w-6 h-6 cursor-pointer" onClick={() => navigate('/add-completed')} />
      <BarChart2 className="text-gray-400 w-6 h-6 cursor-pointer" onClick={() => navigate('/history')} />
      <User className="text-gray-400 w-6 h-6 cursor-pointer" onClick={() => navigate('/profile')} />
    </footer>
  );
};

export default App;