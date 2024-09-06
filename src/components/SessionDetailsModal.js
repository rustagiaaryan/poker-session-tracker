import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { X, Edit, Save, DollarSign, Clock, TrendingUp, GamepadIcon, Monitor, Trophy, Calendar, FileText, Trash2 } from 'lucide-react';

const SessionDetailsModal = ({ session, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSession, setEditedSession] = useState(session);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    setEditedSession(session);
  }, [session]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;

    if (type === 'number') {
      processedValue = value === '' ? 0 : parseFloat(value);
    } else if (name === 'startTime') {
      processedValue = new Date(value).toISOString();
    }

    setEditedSession({ ...editedSession, [name]: processedValue });
  };

  const handleSave = async () => {
    await onUpdate(editedSession._id, editedSession);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(editedSession._id);
    onClose();
  };

  const formatDuration = (minutes) => {
    if (typeof minutes !== 'number') return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const calculateProfitPerHour = (session) => {
    const profit = session.cashOut - session.buyIn;
    const hours = session.duration / 60;
    return hours > 0 ? (profit / hours).toFixed(2) : '0.00';
  };

  const renderField = (label, value, editComponent, icon) => (
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-400 mb-1">
        {icon && React.createElement(icon, { size: 14, className: "inline mr-1" })}
        {label}
      </label>
      {isEditing ? editComponent : <p className="text-white text-lg">{value}</p>}
    </div>
  );

  const profit = editedSession.cashOut - editedSession.buyIn;
  const profitColor = profit >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-gray-900 p-4 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Session Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 grid grid-cols-3 gap-4">
          <div>
            {renderField("Date", format(parseISO(editedSession.startTime), 'MMMM d, yyyy'),
              <input
                type="datetime-local"
                name="startTime"
                value={format(parseISO(editedSession.startTime), "yyyy-MM-dd'T'HH:mm")}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 text-white rounded"
              />,
              Calendar
            )}
            {renderField("Buy In", `$${editedSession.buyIn.toFixed(2)}`, 
              <input 
                type="number" 
                name="buyIn" 
                value={editedSession.buyIn} 
                onChange={handleChange} 
                className="w-full p-2 bg-gray-800 text-white rounded" 
                step="0.01"
                min="0"
              />,
              DollarSign
            )}
            {renderField("Cash Out", `$${editedSession.cashOut.toFixed(2)}`, 
              <input 
                type="number" 
                name="cashOut" 
                value={editedSession.cashOut} 
                onChange={handleChange} 
                className="w-full p-2 bg-gray-800 text-white rounded" 
                step="0.01"
                min="0"
              />,
              DollarSign
            )}
            {renderField("Profit", 
              <span className={profitColor}>${profit.toFixed(2)}</span>, 
              null, 
              DollarSign
            )}
          </div>
          <div>
            {renderField("Duration", formatDuration(editedSession.duration), 
              <input 
                type="number" 
                name="duration" 
                value={editedSession.duration} 
                onChange={handleChange} 
                className="w-full p-2 bg-gray-800 text-white rounded"
                min="0"
              />,
              Clock
            )}
            {renderField("Profit/Hour", `$${calculateProfitPerHour(editedSession)}`, null, TrendingUp)}
            {renderField("Setting", editedSession.setting, 
              <select name="setting" value={editedSession.setting} onChange={handleChange} className="w-full p-2 bg-gray-800 text-white rounded">
                <option value="In Person">In Person</option>
                <option value="Online">Online</option>
              </select>,
              Monitor
            )}
            {renderField("Session Type", editedSession.sessionType, 
              <select name="sessionType" value={editedSession.sessionType} onChange={handleChange} className="w-full p-2 bg-gray-800 text-white rounded">
                <option value="Cash">Cash</option>
                <option value="Tournament">Tournament</option>
              </select>,
              Trophy
            )}
          </div>
          <div>
            {renderField("Game Type", editedSession.gameType, 
              <select name="gameType" value={editedSession.gameType} onChange={handleChange} className="w-full p-2 bg-gray-800 text-white rounded">
                <option value="No Limit Hold'em">No Limit Hold'em</option>
                <option value="Pot Limit Hold'em">Pot Limit Hold'em</option>
                <option value="Omaha">Omaha</option>
                <option value="DBBP Omaha">DBBP Omaha</option>
                <option value="Custom">Custom</option>
              </select>,
              GamepadIcon
            )}
            {isEditing && editedSession.gameType === 'Custom' && (
              <input 
                type="text" 
                name="customGameType" 
                value={editedSession.customGameType || ''} 
                onChange={handleChange} 
                className="w-full p-2 bg-gray-800 text-white rounded mt-2" 
                placeholder="Enter custom game type" 
              />
            )}
            {renderField("Stakes", editedSession.stakes, 
              <select name="stakes" value={editedSession.stakes} onChange={handleChange} className="w-full p-2 bg-gray-800 text-white rounded">
                <option value="0.10/0.20">0.10/0.20</option>
                <option value="0.25/0.50">0.25/0.50</option>
                <option value="0.5/1">0.5/1</option>
                <option value="1/2">1/2</option>
                <option value="2/3">2/3</option>
                <option value="5/10">5/10</option>
                <option value="Custom">Custom</option>
              </select>,
              DollarSign
            )}
            {isEditing && editedSession.stakes === 'Custom' && (
              <input 
                type="text" 
                name="customStakes" 
                value={editedSession.customStakes || ''} 
                onChange={handleChange} 
                className="w-full p-2 bg-gray-800 text-white rounded mt-2" 
                placeholder="Enter custom stakes" 
              />
            )}
            {renderField("Notes", editedSession.notes || 'No notes',
              <textarea
                name="notes"
                value={editedSession.notes || ''}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 text-white rounded"
                rows="3"
              />,
              FileText
            )}
          </div>
        </div>
        <div className="sticky bottom-0 bg-gray-900 p-4 border-t border-gray-800 flex justify-between">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="bg-gray-600 text-white px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded">
                <Save size={18} className="inline mr-2" />
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setShowDeleteConfirmation(true)} className="bg-red-500 text-white px-4 py-2 rounded">
                <Trash2 size={18} className="inline mr-2" />
                Delete Session
              </button>
              <button onClick={() => setIsEditing(true)} className="bg-purple-500 text-white px-4 py-2 rounded">
                <Edit size={18} className="inline mr-2" />
                Edit Session
              </button>
            </>
          )}
        </div>
      </div>
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-white">Confirm Deletion</h3>
            <p className="text-gray-300 mb-4">Are you sure you want to delete this session? This action cannot be undone.</p>
            <div className="flex justify-end">
              <button onClick={() => setShowDeleteConfirmation(false)} className="bg-gray-600 text-white px-4 py-2 rounded mr-2">
                Cancel
              </button>
              <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetailsModal;