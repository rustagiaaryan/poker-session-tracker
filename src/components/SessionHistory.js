import React, { useState, useEffect } from 'react';
import { getSessions, updateSession } from '../services/api';
import { format } from 'date-fns';
import { Edit, Save, X, DollarSign, Clock, TrendingUp, Image } from 'lucide-react';

const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [editingSession, setEditingSession] = useState(null);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [filters, setFilters] = useState({
    profitMin: '',
    profitMax: '',
    gameType: '',
    sessionType: ''
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await getSessions();
      setSessions(response);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
      setError('Failed to load sessions. Please try again later.');
    }
  };

  const handleEdit = (session) => {
    setEditingSession({ ...session });
  };

  const handleSave = async () => {
    try {
      await updateSession(editingSession._id, editingSession);
      setEditingSession(null);
      fetchSessions();
    } catch (error) {
      console.error('Failed to update session', error);
      setError('Failed to update session. Please try again.');
    }
  };

  const handleChange = (e) => {
    setEditingSession({ ...editingSession, [e.target.name]: e.target.value });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const calculateProfitPerHour = (session) => {
    const profit = session.cashOut - session.buyIn;
    const hours = session.duration / 60; // Convert minutes to hours
    return hours > 0 ? (profit / hours).toFixed(2) : '0.00';
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    switch (sortBy) {
      case 'profit':
        return (b.cashOut - b.buyIn) - (a.cashOut - a.buyIn);
      case 'profitPerHour':
        return parseFloat(calculateProfitPerHour(b)) - parseFloat(calculateProfitPerHour(a));
      case 'duration':
        return b.duration - a.duration;
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });

  const filteredSessions = sortedSessions.filter(session => {
    const profit = session.cashOut - session.buyIn;
    return (
      (filters.profitMin === '' || profit >= parseFloat(filters.profitMin)) &&
      (filters.profitMax === '' || profit <= parseFloat(filters.profitMax)) &&
      (filters.gameType === '' || session.gameType === filters.gameType) &&
      (filters.sessionType === '' || session.sessionType === filters.sessionType)
    );
  });

  return (
    <div className="w-full max-w-6xl mx-auto p-4 h-screen overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-purple-500">Session History</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="mb-4">
        <label className="mr-2">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded"
        >
          <option value="date">Date</option>
          <option value="profit">Profit</option>
          <option value="profitPerHour">Profit/Hour</option>
          <option value="duration">Duration</option>
        </select>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block">Profit Range:</label>
          <input
            type="number"
            placeholder="Min"
            value={filters.profitMin}
            onChange={(e) => setFilters({...filters, profitMin: e.target.value})}
            className="bg-gray-700 text-white p-2 rounded w-full"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.profitMax}
            onChange={(e) => setFilters({...filters, profitMax: e.target.value})}
            className="bg-gray-700 text-white p-2 rounded w-full mt-2"
          />
        </div>
        <div>
          <label className="block">Game Type:</label>
          <select
            value={filters.gameType}
            onChange={(e) => setFilters({...filters, gameType: e.target.value})}
            className="bg-gray-700 text-white p-2 rounded w-full"
          >
            <option value="">All</option>
            <option value="Texas Hold'em">Texas Hold'em</option>
            <option value="Omaha">Omaha</option>
            <option value="Seven Card Stud">Seven Card Stud</option>
            <option value="Other">Other</option>
          </select>
          <label className="block mt-2">Session Type:</label>
          <select
            value={filters.sessionType}
            onChange={(e) => setFilters({...filters, sessionType: e.target.value})}
            className="bg-gray-700 text-white p-2 rounded w-full"
          >
            <option value="">All</option>
            <option value="Cash">Cash</option>
            <option value="Tournament">Tournament</option>
          </select>
        </div>
      </div>

      {filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div key={session._id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold">{format(new Date(session.date), 'MMM dd, yyyy')}</span>
                <button
                  onClick={() => handleEdit(session)}
                  className="text-purple-500 hover:text-purple-400"
                >
                  <Edit size={18} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center text-gray-400 mb-1">
                    <DollarSign size={16} className="mr-1" />
                    <span>Profit</span>
                  </div>
                  <span className="text-xl font-bold">${(session.cashOut - session.buyIn).toFixed(2)}</span>
                </div>
                <div>
                  <div className="flex items-center text-gray-400 mb-1">
                    <Clock size={16} className="mr-1" />
                    <span>Duration</span>
                  </div>
                  <span className="text-xl font-bold">{formatDuration(session.duration)}</span>
                </div>
                <div>
                  <div className="flex items-center text-gray-400 mb-1">
                    <TrendingUp size={16} className="mr-1" />
                    <span>Profit/Hour</span>
                  </div>
                  <span className="text-xl font-bold">${calculateProfitPerHour(session)}</span>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                <p>Game: {session.gameType} - Stakes: {session.stakes}</p>
                <p>Setting: {session.setting} - Type: {session.sessionType}</p>
              </div>
              {session.photos && session.photos.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center text-gray-400 mb-1">
                    <Image size={16} className="mr-1" />
                    <span>Photos</span>
                  </div>
                  <div className="flex space-x-2">
                    {session.photos.map((photo, index) => (
                      <img 
                        key={index} 
                        src={`${process.env.REACT_APP_API_URL}/${photo.path}`} 
                        alt={`Session photo ${index + 1}`} 
                        className="w-16 h-16 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-300">No sessions found. Start playing to see your history!</p>
      )}
      
      {editingSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-gray-800 p-4 rounded-lg w-full max-w-2xl m-4">
            <h3 className="text-xl font-bold mb-4 text-purple-500">Edit Session</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  <DollarSign className="text-gray-400 mr-2" />
                  <span className="text-gray-400">Buy In</span>
                </div>
                <input
                  type="number"
                  name="buyIn"
                  value={editingSession.buyIn}
                  onChange={handleChange}
                  placeholder="Buy In"
                  className="w-full p-2 bg-gray-700 text-white rounded"
                />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <DollarSign className="text-gray-400 mr-2" />
                  <span className="text-gray-400">Cash Out</span>
                </div>
                <input
                  type="number"
                  name="cashOut"
                  value={editingSession.cashOut}
                  onChange={handleChange}
                  placeholder="Cash Out"
                  className="w-full p-2 bg-gray-700 text-white rounded"
                />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <Clock className="text-gray-400 mr-2" />
                  <span className="text-gray-400">Duration (minutes)</span>
                </div>
                <input
                  type="number"
                  name="duration"
                  value={editingSession.duration}
                  onChange={handleChange}
                  placeholder="Duration (minutes)"
                  className="w-full p-2 bg-gray-700 text-white rounded"
                />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <Image className="text-gray-400 mr-2" />
                  <span className="text-gray-400">Game Type</span>
                </div>
                <input
                  type="text"
                  name="gameType"
                  value={editingSession.gameType}
                  onChange={handleChange}
                  placeholder="Game Type"
                  className="w-full p-2 bg-gray-700 text-white rounded"
                />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <DollarSign className="text-gray-400 mr-2" />
                  <span className="text-gray-400">Stakes</span>
                </div>
                <input
                  type="text"
                  name="stakes"
                  value={editingSession.stakes}
                  onChange={handleChange}
                  placeholder="Stakes"
                  className="w-full p-2 bg-gray-700 text-white rounded"
                />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <Image className="text-gray-400 mr-2" />
                  <span className="text-gray-400">Setting</span>
                </div>
                <select
                  name="setting"
                  value={editingSession.setting}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                >
                  <option value="In Person">In Person</option>
                  <option value="Online">Online</option>
                </select>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <Image className="text-gray-400 mr-2" />
                  <span className="text-gray-400">Session Type</span>
                </div>
                <select
                  name="sessionType"
                  value={editingSession.sessionType}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                >
                  <option value="Cash">Cash</option>
                  <option value="Tournament">Tournament</option>
                </select>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <Image className="text-gray-400 mr-2" />
                  <span className="text-gray-400">Notes</span>
                </div>
                <textarea
                  name="notes"
                  value={editingSession.notes}
                  onChange={handleChange}
                  placeholder="Notes"
                  className="w-full p-2 bg-gray-700 text-white rounded"
                  rows="3"
                ></textarea>
              </div>
              {editingSession.photos && editingSession.photos.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <Image className="text-gray-400 mr-2" />
                    <span className="text-gray-400">Photos</span>
                  </div>
                  <div className="flex space-x-2">
                    {editingSession.photos.map((photo, index) => (
                      <img 
                        key={index} 
                        src={`${process.env.REACT_APP_API_URL}/${photo.path}`} 
                        alt={`Session photo ${index + 1}`} 
                        className="w-16 h-16 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setEditingSession(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded mr-2"
              >
                <X size={18} className="inline mr-1" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-600 text-white rounded"
              >
                <Save size={18} className="inline mr-1" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;