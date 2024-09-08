import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Pause, Play, Plus, GamepadIcon, DollarSign, Monitor, Trophy, Clock, FileText, X, Edit } from 'lucide-react';
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
  const [editableDuration, setEditableDuration] = useState(0);
  const [showBuyInModal, setShowBuyInModal] = useState(false);
  const [newBuyInAmount, setNewBuyInAmount] = useState('');
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [tip, setTip] = useState('');
  const [sessionName, setSessionName] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    const sessionId = location.state?.sessionId;
    if (sessionId) {
      fetchSession(sessionId);
    } else {
      navigate('/');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (isRunning && session) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, session]);

  const fetchSession = async (sessionId) => {
    try {
      const fetchedSession = await getSession(sessionId);
      setSession(fetchedSession);
      setBuyIns(fetchedSession.buyIns || [{ amount: fetchedSession.buyIn }]);
      setGameType(fetchedSession.gameType || 'No Limit Hold\'em');
      setStakes(fetchedSession.stakes || '1/2');
      setSetting(fetchedSession.setting || 'In Person');
      setSessionType(fetchedSession.sessionType || 'Cash');
      setNotes(fetchedSession.notes || '');
      setTip(fetchedSession.tip || '');
      setSessionName(fetchedSession.sessionName || '');
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
      const totalBuyIn = buyIns.reduce((sum, buyIn) => sum + Number(buyIn.amount), 0);
      const updatedSession = {
        ...session,
        buyIn: totalBuyIn,
        buyIns: buyIns,
        gameType: gameType === 'Custom' ? customGameType : gameType,
        stakes: stakes === 'Custom' ? customStakes : stakes,
        setting,
        sessionType,
        notes,
        duration: Math.ceil(elapsedSeconds / 60), // Convert seconds to minutes, rounding up
        tip,
        sessionName
      };
      await updateSession(session._id, updatedSession);
    } catch (error) {
      console.error('Failed to update session', error);
    }
  };

  const handleFinishClick = () => {
    setShowFinishModal(true);
    setIsRunning(false);
    setEditableDuration(elapsedSeconds);
  };

  const handleFinishSession = async () => {
    if (cashOut !== '' && !isNaN(Number(cashOut))) {
      try {
        const totalBuyIn = buyIns.reduce((sum, buyIn) => sum + Number(buyIn.amount), 0);
        const updatedSession = {
          ...session,
          buyIn: totalBuyIn,
          buyIns: buyIns,
          cashOut: cashOut,
          duration: Math.ceil(editableDuration / 60), // Convert seconds to minutes, rounding up
          gameType: gameType === 'Custom' ? customGameType : gameType,
          stakes: stakes === 'Custom' ? customStakes : stakes,
          setting,
          sessionType,
          notes,
          isActive: false,
          endTime: new Date().toISOString(),
          tip,
          sessionName
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
    setShowBuyInModal(true);
  };

  const submitNewBuyIn = () => {
    if (newBuyInAmount && !isNaN(newBuyInAmount)) {
      setBuyIns([...buyIns, { amount: parseFloat(newBuyInAmount) }]);
      setNewBuyInAmount('');
      setShowBuyInModal(false);
    }
  };

  const totalBuyIn = buyIns.reduce((sum, buyIn) => sum + Number(buyIn.amount), 0);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-4 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <ChevronLeft className="text-purple-500 cursor-pointer" onClick={() => navigate('/')} />
        <div className="text-3xl font-bold text-purple-500">
          {formatTime(elapsedSeconds)}
        </div>
        <button 
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition duration-300"
          onClick={handleFinishClick}
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
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold">Session Name</span>
          </div>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="w-full bg-gray-700 p-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter session name"
          />
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Buy-In</span>
            <div className="flex items-center">
              <span className="mr-2 text-xl font-bold">${totalBuyIn.toFixed(2)}</span>
              <span className="bg-purple-500 text-white px-2 py-1 rounded-lg mr-2">{buyIns.length}</span>
              <Plus className="text-purple-500 cursor-pointer hover:text-purple-400 transition duration-300" onClick={handleAddBuyIn} />
            </div>
          </div>
          {buyIns.length > 0 && (
            <div className="mt-2">
              {buyIns.map((buyIn, index) => (
                <div key={index} className="text-sm text-gray-400">
                  Buy-in {index + 1}: ${Number(buyIn.amount).toFixed(2)}
                </div>
              ))}
            </div>
          )}
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
            <DollarSign className="text-purple-500 mr-2" />
            <span className="text-lg font-semibold">Tip</span>
          </div>
          <input
            type="number"
            value={tip}
            onChange={(e) => setTip(e.target.value)}
            className="w-full bg-gray-700 p-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter tip amount"
          />
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

      {showBuyInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-purple-500">Add Buy-In</h3>
            <input
              type="number"
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={newBuyInAmount}
              onChange={(e) => setNewBuyInAmount(e.target.value)}
              placeholder="Enter buy-in amount"
            />
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded-lg mr-2 hover:bg-gray-700 transition duration-300"
                onClick={() => setShowBuyInModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300"
                onClick={submitNewBuyIn}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md relative">
            <button 
              onClick={() => {
                setShowFinishModal(false);
                setIsRunning(true);
              }} 
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-4 text-purple-500">Finish Session</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">Duration</label>
              <div className="text-2xl font-bold text-purple-500 flex items-center">
                {formatTime(editableDuration)}
                <button onClick={() => setIsEditingTime(!isEditingTime)} className="ml-2 text-purple-500">
                  <Edit size={18} />
                </button>
              </div>
              {isEditingTime && (
                <div className="flex items-center mt-2">
                  <input
                    type="number"
                    value={Math.floor(editableDuration / 3600)}
                    onChange={(e) => setEditableDuration(e.target.value * 3600 + (editableDuration % 3600))}
                    className="w-16 p-2 bg-gray-700 text-white rounded mr-1"
                    min="0"
                  />
                  :
                  <input
                    type="number"
                    value={Math.floor((editableDuration % 3600) / 60)}
                    onChange={(e) => setEditableDuration(Math.floor(editableDuration / 3600) * 3600 + e.target.value * 60 + (editableDuration % 60))}
                    className="w-16 p-2 bg-gray-700 text-white rounded mx-1"
                    min="0"
                    max="59"
                  />
                  :
                  <input
                    type="number"
                    value={editableDuration % 60}
                    onChange={(e) => setEditableDuration(Math.floor(editableDuration / 60) * 60 + Number(e.target.value))}
                    className="w-16 p-2 bg-gray-700 text-white rounded ml-1"
                    min="0"
                    max="59"
                  />
                </div>
              )}
            </div>
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