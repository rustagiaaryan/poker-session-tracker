import './App.css';
import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Settings, Award, Home, PlusCircle, BarChart2, User, LogOut } from 'lucide-react';
import { getSessions, createSession, updateSession } from './services/api';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import HomePage from './components/HomePage';
import SessionHistory from './components/SessionHistory';
import ActiveSession from './components/ActiveSession';
import AddCompletedSession from './components/AddCompletedSession';
import Profile from './components/Profile';
import GoogleCallback from './components/GoogleCallback';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated, location.pathname]);

  const fetchSessions = async () => {
    try {
      const response = await getSessions();
      setSessions(response);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    }
  };

  const handleStartLiveSession = async (sessionData) => {
    try {
      const response = await createSession(sessionData);
      setSessions([...sessions, response]);
      return response;
    } catch (error) {
      console.error('Failed to start session', error);
      throw error;
    }
  };

  const handleUpdateSession = async (sessionId, updatedSessionData) => {
    try {
      const updatedSession = await updateSession(sessionId, updatedSessionData);
      setSessions(sessions.map(session => 
        session._id === sessionId ? updatedSession : session
      ));
      await fetchSessions();
    } catch (error) {
      console.error('Failed to update session', error);
      throw error;
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    fetchSessions();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setSessions([]);
    navigate('/login');
  };

  const NavbarIcon = ({ icon: Icon, path, label }) => {
    const isActive = location.pathname === path;
    return (
      <div className="relative group">
        <Icon
          className={`w-6 h-6 cursor-pointer transition-colors duration-200 ${
            isActive ? 'text-purple-500' : 'text-gray-400 group-hover:text-white'
          }`}
          onClick={() => navigate(path)}
        />
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {label}
        </span>
      </div>
    );
  };

  return (
    <GoogleOAuthProvider clientId="214253996238-t6mhj3nei468tdbismja00rnj0a0iiti.apps.googleusercontent.com">
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
            <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <Register onRegister={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/" element={isAuthenticated ? <HomePage startLiveSession={handleStartLiveSession} /> : <Navigate to="/login" />} />
            <Route path="/history" element={isAuthenticated ? <SessionHistory sessions={sessions.filter(s => !s.isActive)} onUpdateSession={handleUpdateSession} fetchSessions={fetchSessions} /> : <Navigate to="/login" />} />
            <Route path="/active-session" element={isAuthenticated ? <ActiveSession onUpdateSession={handleUpdateSession} /> : <Navigate to="/login" />} />
            <Route path="/add-completed" element={isAuthenticated ? <AddCompletedSession onSessionAdded={fetchSessions} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/auth/google/success" element={<GoogleCallback onLogin={handleLogin} />} />
          </Routes>
        </main>

        {isAuthenticated && (
          <footer className="flex justify-around items-center p-4 bg-gray-800">
            <NavbarIcon icon={Home} path="/" label="Home" />
            <NavbarIcon icon={PlusCircle} path="/add-completed" label="Add Session" />
            <NavbarIcon icon={BarChart2} path="/history" label="History" />
            <NavbarIcon icon={User} path="/profile" label="Profile" />
          </footer>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;