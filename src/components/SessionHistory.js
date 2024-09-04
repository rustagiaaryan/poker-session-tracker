import React, { useState, useEffect } from 'react';
import { getSessions, updateSession } from '../services/api';
import { format } from 'date-fns';

const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [editingSession, setEditingSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await getSessions();
      console.log('Fetched sessions:', response);  // Debug log
      if (Array.isArray(response)) {
        setSessions(response);
      } else {
        console.error('Fetched sessions is not an array:', response);
        setError('Failed to load sessions. Please try again later.');
      }
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

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-purple-500">Session History</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {Array.isArray(sessions) && sessions.length > 0 ? (
        <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Buy In</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cash Out</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Profit</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Profit/Hour</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sessions.map((session) => (
                <tr key={session._id}>
                  <td className="px-4 py-2 whitespace-nowrap">{format(new Date(session.date), 'MM/dd/yyyy')}</td>
                  <td className="px-4 py-2 whitespace-nowrap">${session.buyIn}</td>
                  <td className="px-4 py-2 whitespace-nowrap">${session.cashOut}</td>
                  <td className="px-4 py-2 whitespace-nowrap">${(session.cashOut - session.buyIn).toFixed(2)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">${((session.cashOut - session.buyIn) / (session.duration / 60)).toFixed(2)}/hr</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(session)}
                      className="text-purple-500 hover:text-purple-400"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-300">No sessions found. Start playing to see your history!</p>
      )}
      {editingSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-4 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-purple-500">Edit Session</h3>
            <input
              type="number"
              name="buyIn"
              value={editingSession.buyIn}
              onChange={handleChange}
              placeholder="Buy In"
              className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
            />
            <input
              type="number"
              name="cashOut"
              value={editingSession.cashOut}
              onChange={handleChange}
              placeholder="Cash Out"
              className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
            />
            <input
              type="number"
              name="duration"
              value={editingSession.duration}
              onChange={handleChange}
              placeholder="Duration (minutes)"
              className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
            />
            <input
              type="text"
              name="location"
              value={editingSession.location}
              onChange={handleChange}
              placeholder="Location"
              className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
            />
            <input
              type="text"
              name="gameType"
              value={editingSession.gameType}
              onChange={handleChange}
              placeholder="Game Type"
              className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
            />
            <textarea
              name="notes"
              value={editingSession.notes}
              onChange={handleChange}
              placeholder="Notes"
              className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
            ></textarea>
            <div className="flex justify-end">
              <button
                onClick={() => setEditingSession(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;