import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Pause, Play, Plus, Camera, GamepadIcon, DollarSign, Monitor, Trophy, FileText } from 'lucide-react';

const ActiveSession = ({ session, onEndSession, onUpdateSession, onDiscardSession }) => {
  const navigate = useNavigate();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [buyIns, setBuyIns] = useState([{ amount: session.buyIn, count: 1 }]);
  const [gameType, setGameType] = useState(session.gameType || 'No Limit Hold\'em');
  const [stakes, setStakes] = useState(session.stakes || '1/2');
  const [setting, setSetting] = useState(session.setting || 'In Person');
  const [sessionType, setSessionType] = useState(session.sessionType || 'Cash');
  const [notes, setNotes] = useState(session.notes || '');
  const [showCustomGameType, setShowCustomGameType] = useState(false);
  const [showCustomStakes, setShowCustomStakes] = useState(false);
  const [customGameType, setCustomGameType] = useState('');
  const [customStakes, setCustomStakes] = useState({ sb: '', bb: '', ante: '', straddle: '' });
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [cashOut, setCashOut] = useState('');

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);}, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddBuyIn = () => {
    const newBuyIn = prompt('Enter additional buy-in amount:');
    if (newBuyIn && !isNaN(newBuyIn)) {
      setBuyIns([...buyIns, { amount: parseFloat(newBuyIn), count: 1 }]);
    }
  };

  const handleUpdateSession = () => {
    onUpdateSession({
      buyIns,
      gameType: gameType === 'Custom' ? customGameType : gameType,
      stakes: stakes === 'Custom' ? `${customStakes.sb}/${customStakes.bb}${customStakes.ante ? ` (Ante: ${customStakes.ante})` : ''}${customStakes.straddle ? ` (Straddle: ${customStakes.straddle})` : ''}` : stakes,
      setting,
      sessionType,
      notes,
      duration: elapsedTime
    });
  };

  const handleFinishSession = async () => {
    if (cashOut && !isNaN(cashOut)) {
      await onEndSession({
        buyIn: buyIns.reduce((total, buyIn) => total + buyIn.amount, 0),
        cashOut: parseFloat(cashOut),
        duration: elapsedTime,
        gameType,
        stakes,
        setting,
        sessionType,
        notes
      });
      navigate('/history');
    } else {
      alert('Please enter a valid cash out amount');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-4 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <ChevronLeft className="text-purple-500 cursor-pointer" onClick={onDiscardSession} />
        <div className="text-2xl font-bold text-purple-500">{formatTime(elapsedTime)}</div>
        <button 
          className="bg-purple-500 text-white px-4 py-2 rounded"
          onClick={() => setShowFinishModal(true)}
        >
          Finish
        </button>
      </div>

      <button 
        className="w-full bg-purple-500 text-white p-3 rounded flex items-center justify-center mb-4"
        onClick={() => {
          setIsRunning(!isRunning);
          handleUpdateSession();
        }}
      >
        {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
        {isRunning ? 'Pause Session' : 'Resume Session'}
      </button>

      <div className="space-y-4">
        <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
          <span>Buy-In</span>
          <div className="flex items-center">
            <span className="mr-2">${buyIns.reduce((sum, bi) => sum + bi.amount * bi.count, 0).toFixed(2)}</span>
            <span className="bg-purple-500 text-white px-2 py-1 rounded mr-2">{buyIns.reduce((sum, bi) => sum + bi.count, 0)}</span>
            <Plus className="text-purple-500 cursor-pointer" onClick={handleAddBuyIn} />
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <div className="flex items-center mb-2">
            <GamepadIcon className="text-gray-400 mr-2" />
            <span>Game Type</span>
          </div>
          <select 
            className="w-full bg-gray-700 p-2 rounded text-white"
            value={gameType}
            onChange={(e) => {
              if (e.target.value === 'Custom') {
                setShowCustomGameType(true);
              } else {
                setGameType(e.target.value);
              }
            }}
          >
            <option>No Limit Hold'em</option>
            <option>Pot Limit Hold'em</option>
            <option>Omaha</option>
            <option>DBBP Omaha</option>
            <option value="Custom">Custom</option>
          </select>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <div className="flex items-center mb-2">
            <DollarSign className="text-gray-400 mr-2" />
            <span>Stakes</span>
          </div>
          <select 
            className="w-full bg-gray-700 p-2 rounded text-white"
            value={stakes}
            onChange={(e) => {
              if (e.target.value === 'Custom') {
                setShowCustomStakes(true);
              } else {
                setStakes(e.target.value);
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
            <option value="Custom">Custom</option>
          </select>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <div className="flex items-center mb-2">
            <Monitor className="text-gray-400 mr-2" />
            <span>Setting</span>
          </div>
          <select 
            className="w-full bg-gray-700 p-2 rounded text-white"
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
          >
            <option>In Person</option>
            <option>Online</option>
          </select>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <div className="flex items-center mb-2">
            <Trophy className="text-gray-400 mr-2" />
            <span>Session Type</span>
          </div>
          <select 
            className="w-full bg-gray-700 p-2 rounded text-white"
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
          >
            <option>Cash</option>
            <option>Tournament</option>
          </select>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <div className="flex items-center mb-2">
            <FileText className="text-gray-400 mr-2" />
            <span>Notes</span>
          </div>
          <textarea
            className="w-full bg-gray-700 p-2 rounded text-white"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes..."
            rows={3}
          />
        </div>
      </div>

      {showCustomGameType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-4 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-purple-500">Custom Game Type</h3>
            <input
              type="text"
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
              value={customGameType}
              onChange={(e) => setCustomGameType(e.target.value)}
              placeholder="Enter custom game type"
            />
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded mr-2"
                onClick={() => setShowCustomGameType(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-purple-500 text-white rounded"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-4 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-purple-500">Custom Stakes</h3>
            <input
              type="text"
              className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
              value={customStakes.sb}
              onChange={(e) => setCustomStakes({...customStakes, sb: e.target.value})}
              placeholder="Small Blind"
            />
            <input
              type="text"
              className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
              value={customStakes.bb}
              onChange={(e) => setCustomStakes({...customStakes, bb: e.target.value})}
              placeholder="Big Blind"
            />
            <input
              type="text"
              className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
              value={customStakes.ante}
              onChange={(e) => setCustomStakes({...customStakes, ante: e.target.value})}
              placeholder="Ante (optional)"
            />
            <input
              type="text"
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
              value={customStakes.straddle}
              onChange={(e) => setCustomStakes({...customStakes, straddle: e.target.value})}
              placeholder="Straddle (optional)"
            />
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded mr-2"
                onClick={() => setShowCustomStakes(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-purple-500 text-white rounded"
                onClick={() => {
                  setStakes(`${customStakes.sb}/${customStakes.bb}${customStakes.ante ? ` (Ante: ${customStakes.ante})` : ''}${customStakes.straddle ? ` (Straddle: ${customStakes.straddle})` : ''}`);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-4 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-purple-500">Finish Session</h3>
            <p className="text-center text-4xl font-bold text-purple-500 mb-4">{formatTime(elapsedTime)}</p>
            <input
              type="number"
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
              value={cashOut}
              onChange={(e) => setCashOut(e.target.value)}
              placeholder="Cash out amount"
            />
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={() => {
                  onDiscardSession();
                  navigate('/');
                }}
              >
                Discard
              </button>
              <button
                className="px-4 py-2 bg-purple-500 text-white rounded"
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