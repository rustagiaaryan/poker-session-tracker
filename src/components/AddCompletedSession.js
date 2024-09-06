import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, GamepadIcon, DollarSign, Monitor, Trophy, Clock, Calendar } from 'lucide-react';

const AddCompletedSession = ({ onSessionAdded }) => {
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState({
    buyIn: '',
    cashOut: '',
    gameType: 'No Limit Hold\'em',
    stakes: '1/2',
    setting: 'In Person',
    sessionType: 'Cash',
    notes: '',
    startTime: new Date().toISOString().slice(0, 16),
    duration: ''
  });

  const [showCustomGameType, setShowCustomGameType] = useState(false);
  const [showCustomStakes, setShowCustomStakes] = useState(false);
  const [customGameType, setCustomGameType] = useState('');
  const [customStakes, setCustomStakes] = useState({ sb: '', bb: '', ante: '', straddle: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setSessionData({ ...sessionData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const startTime = new Date(sessionData.startTime);
      const endTime = new Date(startTime.getTime() + sessionData.duration * 60000);
      
      const newSession = {
        ...sessionData,
        gameType: sessionData.gameType === 'Custom' ? customGameType : sessionData.gameType,
        stakes: sessionData.stakes === 'Custom' ? 
          `${customStakes.sb}/${customStakes.bb}${customStakes.ante ? ` (Ante: ${customStakes.ante})` : ''}${customStakes.straddle ? ` (Straddle: ${customStakes.straddle})` : ''}` 
          : sessionData.stakes,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isActive: false
      };
  
      await onSessionAdded(newSession);
      navigate('/history');
    } catch (error) {
      console.error('Failed to add session', error);
      alert('Failed to add session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-4 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <ChevronLeft className="text-purple-500 cursor-pointer" onClick={() => navigate('/')} />
        <div className="text-2xl font-bold text-purple-500">Add Completed Session</div>
        <div></div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
          <span>Buy-In</span>
          <div className="flex items-center">
            <DollarSign className="text-gray-400 mr-2" />
            <input
              type="number"
              name="buyIn"
              value={sessionData.buyIn}
              onChange={handleChange}
              className="w-24 p-2 bg-gray-700 text-white rounded text-right"
            />
          </div>
        </div>

        <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
          <span>Cash Out</span>
          <div className="flex items-center">
            <DollarSign className="text-gray-400 mr-2" />
            <input
              type="number"
              name="cashOut"
              value={sessionData.cashOut}
              onChange={handleChange}
              className="w-24 p-2 bg-gray-700 text-white rounded text-right"
            />
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <div className="flex items-center mb-2">
            <GamepadIcon className="text-gray-400 mr-2" />
            <span>Game Type</span>
          </div>
          <select 
            className="w-full bg-gray-700 p-2 rounded text-white"
            name="gameType"
            value={sessionData.gameType}
            onChange={(e) => {
              handleChange(e);
              if (e.target.value === 'Custom') {
                setShowCustomGameType(true);
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
            name="stakes"
            value={sessionData.stakes}
            onChange={(e) => {
              handleChange(e);
              if (e.target.value === 'Custom') {
                setShowCustomStakes(true);
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
            name="setting"
            value={sessionData.setting}
            onChange={handleChange}
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
            name="sessionType"
            value={sessionData.sessionType}
            onChange={handleChange}
          >
            <option>Cash</option>
            <option>Tournament</option>
          </select>
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <div className="flex items-center mb-2">
            <Calendar className="text-gray-400 mr-2" />
            <span>Start Date and Time</span>
          </div>
          <input
            type="datetime-local"
            name="startTime"
            value={sessionData.startTime}
            onChange={handleChange}
            className="w-full bg-gray-700 p-2 rounded text-white"
          />
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <div className="flex items-center mb-2">
            <Clock className="text-gray-400 mr-2" />
            <span>Duration (minutes)</span>
          </div>
          <input
            type="number"
            name="duration"
            value={sessionData.duration}
            onChange={handleChange}
            className="w-full bg-gray-700 p-2 rounded text-white"
          />
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <div className="flex items-center mb-2">
            <span>Notes</span>
          </div>
          <textarea
            name="notes"
            value={sessionData.notes}
            onChange={handleChange}
            className="w-full bg-gray-700 p-2 rounded text-white"
            rows="3"
          />
        </div>
      </div>

      <button 
        className={`w-full bg-purple-500 text-white p-3 rounded flex items-center justify-center mt-4 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        <Plus className="mr-2" />
        {isSubmitting ? 'Adding Session...' : 'Add Completed Session'}
      </button>

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
                  setSessionData({...sessionData, gameType: customGameType});
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
                  setSessionData({...sessionData, stakes: `${customStakes.sb}/${customStakes.bb}${customStakes.ante ? ` (Ante: ${customStakes.ante})` : ''}${customStakes.straddle ? ` (Straddle: ${customStakes.straddle})` : ''}`});
                  setShowCustomStakes(false);
                }}
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

export default AddCompletedSession;