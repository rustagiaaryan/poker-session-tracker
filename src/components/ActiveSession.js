import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Pause, Play, Plus, GamepadIcon, DollarSign, Monitor, Trophy, Clock, FileText } from 'lucide-react';
import { getSession, updateSession, deleteSession } from '../services/api';

const ActiveSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [buyIns, setBuyIns] = useState([]);
  const [gameType, setGameType] = useState('');
  const [stakes, setStakes] = useState('');
  const [setting, setSetting] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [notes, setNotes] = useState('');
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [cashOut, setCashOut] = useState('');
  const [showCustomGameType, setShowCustomGameType] = useState(false);
  const [showCustomStakes, setShowCustomStakes] = useState(false);
  const [customGameType, setCustomGameType] = useState('');
  const [customStakes, setCustomStakes] = useState('');

  useEffect(() => {
    const sessionId = location.state?.sessionId;
    if (sessionId) {
      fetchSession(sessionId);
    } else {
      navigate('/');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    let interval;
    if (isRunning && session) {
      interval = setInterval(() => {
        setElapsedSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, session]);

  const fetchSession = async (sessionId) => {
    try {
      const fetchedSession = await getSession(sessionId);
      setSession(fetchedSession);
      setBuyIns([{ amount: fetchedSession.buyIn, count: 1 }]);
      setGameType(fetchedSession.gameType || 'No Limit Hold\'em');
      setStakes(fetchedSession.stakes || '1/2');
      setSetting(fetchedSession.setting || 'In Person');
      setSessionType(fetchedSession.sessionType || 'Cash');
      setNotes(fetchedSession.notes || '');
      const startTime = new Date(fetchedSession.startTime);
      const now = new Date();
      setElapsedSeconds(Math.floor((now - startTime) / 1000));
    } catch (error) {
      console.error('Failed to fetch session', error);
      navigate('/');
    }
  };

  const handleUpdateSession = async () => {
    try {
      const updatedSession = {
        ...session,
        buyIn: buyIns.reduce((total, buyIn) => total + buyIn.amount, 0),
        gameType: gameType === 'Custom' ? customGameType : gameType,
        stakes: stakes === 'Custom' ? customStakes : stakes,
        setting,
        sessionType,
        notes,
        duration: elapsedSeconds
      };
      await updateSession(session._id, updatedSession);
    } catch (error) {
      console.error('Failed to update session', error);
    }
  };

  const handleFinishSession = async () => {
    const cashOutValue = parseFloat(cashOut);
    if (!isNaN(cashOutValue)) {
      try {
        const updatedSession = {
          ...session,
          buyIn: buyIns.reduce((total, buyIn) => total + buyIn.amount, 0),
          cashOut: cashOutValue,
          duration: Math.ceil(elapsedSeconds / 60),
          gameType: gameType === 'Custom' ? customGameType : gameType,
          stakes: stakes === 'Custom' ? customStakes : stakes,
          setting,
          sessionType,
          notes,
          isActive: false,
          endTime: new Date().toISOString()
        };
        await updateSession(session._id, updatedSession);
        navigate('/history');
      } catch (error) {
        console.error('Failed to finish session', error);
      }
    } else {
      alert('Please enter a valid cash out amount');
    }
  };

  const handleDiscard = async () => {
    try {
      await deleteSession(session._id);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete session', error);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAddBuyIn = () => {
    const newBuyIn = prompt('Enter additional buy-in amount:');
    if (newBuyIn && !isNaN(newBuyIn)) {
      setBuyIns([...buyIns, { amount: parseFloat(newBuyIn), count: 1 }]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-4 w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <ChevronLeft className="text-purple-500 cursor-pointer" onClick={() => navigate('/')} />
        <div className="text-3xl font-bold text-purple-500">{formatTime(elapsedSeconds)}</div>
        <button 
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition duration-300"
          onClick={() => setShowFinishModal(true)}
        >
          Finish
        </button>
      </div>

      <button 
        className="w-full bg-purple-500 text-white p-3 rounded-lg flex items-center justify-center mb-6 hover:bg-purple-600 transition duration-300"
        onClick={() => {
          setIsRunning(!isRunning);
          handleUpdateSession();
        }}
      >
        {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
        {isRunning ? 'Pause Session' : 'Resume Session'}
      </button>

      <div className="space-y-6 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Buy-In</span>
            <div className="flex items-center">
              <span className="mr-2 text-xl font-bold">${buyIns.reduce((sum, bi) => sum + bi.amount * bi.count, 0).toFixed(2)}</span>
              <span className="bg-purple-500 text-white px-2 py-1 rounded-lg mr-2">{buyIns.reduce((sum, bi) => sum + bi.count, 0)}</span>
              <Plus className="text-purple-500 cursor-pointer hover:text-purple-400 transition duration-300" onClick={handleAddBuyIn} />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center mb-2">
            <GamepadIcon className="text-purple-500 mr-2" />
            <span className="text-lg font-semibold">Game Type</span>
          </div>
          <select 
            className="w-full bg-gray-700 p-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={gameType}
            onChange={(e) => {
              if (e.target.value === 'Custom') {
                setShowCustomGameType(true);
              } else {
                setGameType(e.target.value);
                setCustomGameType('');
              }
            }}
          >
            <option>No Limit Hold'em</option>
            <option>Pot Limit Hold'em</option>
            <option>Omaha</option>
            <option>DBBP Omaha</option>
            {customGameType && <option value={customGameType}>{customGameType}</option>}
            <option value="Custom">Custom</option>
          </select>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center mb-2">
            <DollarSign className="text-purple-500 mr-2" />
            <span className="text-lg font-semibold">Stakes</span>
          </div>
          <select 
            className="w-full bg-gray-700 p-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={stakes}
            onChange={(e) => {
              if (e.target.value === 'Custom') {
                setShowCustomStakes(true);
              } else {
                setStakes(e.target.value);
                setCustomStakes('');
              }
            }}
          >
            <option>0.10/0.20</option>
            <option>0.25/0.50</option>
            <option>0.5/1</option>
            <option>1/2</option>
            <option>2/3</option>
            <option>5/10</option>
            <option>10/20</option>
            <option>25/50</option>
            <option>100/200</option>
            {customStakes && <option value={customStakes}>{customStakes}</option>}
            <option value="Custom">Custom</option>
          </select>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center mb-2">
            <Monitor className="text-purple-500 mr-2" />
            <span className="text-lg font-semibold">Setting</span>
          </div>
          <select 
            className="w-full bg-gray-700 p-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
          >
            <option>In Person</option>
            <option>Online</option>
          </select>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center mb-2">
            <Trophy className="text-purple-500 mr-2" />
            <span className="text-lg font-semibold">Session Type</span>
          </div>
          <select 
            className="w-full bg-gray-700 p-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
          >
            <option>Cash</option>
            <option>Tournament</option>
          </select>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center mb-2">
            <FileText className="text-purple-500 mr-2" />
            <span className="text-lg font-semibold">Notes</span>
          </div>
          <textarea
            className="w-full bg-gray-700 p-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes..."
            rows={3}
          />
        </div>
      </div>

      {showCustomGameType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-purple-500">Custom Game Type</h3>
            <input
              type="text"
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={customGameType}
              onChange={(e) => setCustomGameType(e.target.value)}
              placeholder="Enter custom game type"
            />
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded-lg mr-2 hover:bg-gray-700 transition duration-300"
                onClick={() => setShowCustomGameType(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300"
                onClick={() => {
                  setGameType(customGameType);
                  setShowCustomGameType(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showCustomStakes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-purple-500">Custom Stakes</h3>
            <input
              type="text"
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={customStakes}
              onChange={(e) => setCustomStakes(e.target.value)}
              placeholder="Enter custom stakes (e.g., 1/2/5)"
            />
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded-lg mr-2 hover:bg-gray-700 transition duration-300"
                onClick={() => setShowCustomStakes(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300"
                onClick={() => {
                  setStakes(customStakes);
                  setShowCustomStakes(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-2xl font-bold mb-4 text-purple-500">Finish Session</h3>
            <p className="text-center text-4xl font-bold text-purple-500 mb-6">{formatTime(elapsedSeconds)}</p>
            <input
              type="number"
              className="w-full p-3 mb-6 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={cashOut}
              onChange={(e) => setCashOut(e.target.value)}
              placeholder="Cash out amount"
              step="0.01"
              min="0"
            />
            <div className="flex justify-between">
              <button
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                onClick={handleDiscard}
              >
                Discard
              </button>
              <button
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300"
                onClick={handleFinishSession}
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

export default ActiveSession;