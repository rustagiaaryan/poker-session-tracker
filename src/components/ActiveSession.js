import React, { useState, useEffect } from 'react';
import { ChevronLeft, Pause, Play, Plus, Camera, ChevronRight } from 'lucide-react';

const ActiveSession = ({ session, onEndSession, onUpdateSession }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [buyIns, setBuyIns] = useState([{ amount: session.buyIn, count: 1 }]);
  const [tips, setTips] = useState(0);
  const [gameType, setGameType] = useState('Texas Hold\'em');
  const [stakes, setStakes] = useState('');
  const [setting, setSetting] = useState('In Person');
  const [sessionType, setSessionType] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [customGameType, setCustomGameType] = useState('');
  const [customStakes, setCustomStakes] = useState({ sb: '', bb: '', ante: '', straddle: '' });

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
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

  const handleAddTip = () => {
    const newTip = prompt('Enter tip or expense amount:');
    if (newTip && !isNaN(newTip)) {
      setTips(tips + parseFloat(newTip));
    }
  };

  const handleUpdateSession = () => {
    onUpdateSession({
      buyIns,
      tips,
      gameType: gameType === 'Custom' ? customGameType : gameType,
      stakes: stakes === 'Custom' ? `${customStakes.sb}/${customStakes.bb}${customStakes.ante ? ` (Ante: ${customStakes.ante})` : ''}${customStakes.straddle ? ` (Straddle: ${customStakes.straddle})` : ''}` : stakes,
      setting,
      sessionType,
      notes,
      duration: elapsedTime
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <ChevronLeft className="text-orange-500 cursor-pointer" onClick={() => {/* Handle back navigation */}} />
        <div className="text-2xl font-bold text-orange-500">{formatTime(elapsedTime)}</div>
        <button 
          className="bg-orange-500 text-white px-4 py-2 rounded"
          onClick={() => {
            handleUpdateSession();
            onEndSession();
          }}
        >
          Finish
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
          <span>Buy-In</span>
          <div className="flex items-center">
            <span className="mr-2">${buyIns.reduce((sum, bi) => sum + bi.amount * bi.count, 0).toFixed(2)}</span>
            <span className="bg-orange-500 text-white px-2 py-1 rounded mr-2">{buyIns.reduce((sum, bi) => sum + bi.count, 0)}</span>
            <Plus className="text-orange-500 cursor-pointer" onClick={handleAddBuyIn} />
          </div>
        </div>

        <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
          <span>Tips & Expenses</span>
          <div className="flex items-center">
            <span className="mr-2">${tips.toFixed(2)}</span>
            <span className="bg-orange-500 text-white px-2 py-1 rounded mr-2">0</span>
            <Plus className="text-orange-500 cursor-pointer" onClick={handleAddTip} />
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded flex items-center justify-between">
          <Camera className="text-gray-400" />
          <span>Add Photos</span>
          <ChevronRight className="text-gray-400" />
        </div>

        <select 
          className="w-full bg-gray-800 p-3 rounded text-white"
          value={gameType}
          onChange={(e) => setGameType(e.target.value)}
        >
          <option>No Limit Hold'em</option>
          <option>Pot Limit Hold'em</option>
          <option>Omaha</option>
          <option>DBBP Omaha</option>
          <option value="Custom">Custom</option>
        </select>
        {gameType === 'Custom' && (
          <input
            type="text"
            className="w-full bg-gray-800 p-3 rounded text-white"
            placeholder="Enter custom game type"
            value={customGameType}
            onChange={(e) => setCustomGameType(e.target.value)}
          />
        )}

        <select 
          className="w-full bg-gray-800 p-3 rounded text-white"
          value={stakes}
          onChange={(e) => setStakes(e.target.value)}
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
        {stakes === 'Custom' && (
          <div className="space-y-2">
            <input
              type="text"
              className="w-full bg-gray-800 p-3 rounded text-white"
              placeholder="Small Blind"
              value={customStakes.sb}
              onChange={(e) => setCustomStakes({...customStakes, sb: e.target.value})}
            />
            <input
              type="text"
              className="w-full bg-gray-800 p-3 rounded text-white"
              placeholder="Big Blind"
              value={customStakes.bb}
              onChange={(e) => setCustomStakes({...customStakes, bb: e.target.value})}
            />
            <input
              type="text"
              className="w-full bg-gray-800 p-3 rounded text-white"
              placeholder="Ante (optional)"
              value={customStakes.ante}
              onChange={(e) => setCustomStakes({...customStakes, ante: e.target.value})}
            />
            <input
              type="text"
              className="w-full bg-gray-800 p-3 rounded text-white"
              placeholder="Straddle (optional)"
              value={customStakes.straddle}
              onChange={(e) => setCustomStakes({...customStakes, straddle: e.target.value})}
            />
          </div>
        )}

        <select 
          className="w-full bg-gray-800 p-3 rounded text-white"
          value={setting}
          onChange={(e) => setSetting(e.target.value)}
        >
          <option>In Person</option>
          <option>Online</option>
        </select>

        <select 
          className="w-full bg-gray-800 p-3 rounded text-white"
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value)}
        >
          <option>Cash</option>
          <option>Tournament</option>
        </select>

        <textarea
          className="w-full bg-gray-800 p-3 rounded text-white"
          placeholder="Add notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="mt-auto">
        <button 
          className="w-full bg-orange-500 text-white p-3 rounded flex items-center justify-center"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isRunning ? 'Pause Session' : 'Resume Session'}
        </button>
      </div>
    </div>
  );
};

export default ActiveSession;