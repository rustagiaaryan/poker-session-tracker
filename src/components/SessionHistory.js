import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, isValid, parseISO, isWithinInterval, endOfDay } from 'date-fns';
import { Edit, Save, X, DollarSign, Clock, TrendingUp, GamepadIcon, Monitor, Trophy, Filter, ChevronLeft } from 'lucide-react';

const SessionHistory = ({ sessions, onUpdateSession, fetchSessions }) => {
  const navigate = useNavigate();
  const [graphData, setGraphData] = useState([]);
  const [editingSession, setEditingSession] = useState(null);
  const [error, setError] = useState(null);
  const [overallProfit, setOverallProfit] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    profitMin: '',
    profitMax: '',
    setting: '',
    gameType: '',
    stakes: '',
    sessionType: '',
    startDate: '',
    endDate: ''
  });
  const [sortBy, setSortBy] = useState('startTime');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filteredSessions, setFilteredSessions] = useState(sessions);

  useEffect(() => {
    updateGraphData(filteredSessions);
    calculateOverallProfit(filteredSessions);
  }, [filteredSessions]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [sessions, filters, sortBy, sortOrder]);

  const updateGraphData = (sessionData) => {
    let cumulativeProfit = 0;
    const data = sessionData
      .filter(session => isValid(parseISO(session.startTime)))
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .map(session => {
        const profit = session.cashOut - session.buyIn;
        cumulativeProfit += profit;
        return {
          date: parseISO(session.startTime),
          profit: cumulativeProfit
        };
      });
    setGraphData(data);
  };

  const calculateOverallProfit = (sessionData) => {
    const totalProfit = sessionData.reduce((sum, session) => sum + (session.cashOut - session.buyIn), 0);
    setOverallProfit(totalProfit);
  };

  const handleEdit = (session) => {
    setEditingSession({ ...session });
  };

  const handleSave = async () => {
    try {
      await onUpdateSession(editingSession._id, editingSession);
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
    const hours = session.duration / 60;
    return hours > 0 ? (profit / hours).toFixed(2) : '0.00';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-2 rounded border border-gray-700">
          <p className="text-white">{`Date: ${format(label, 'MMM dd, yyyy HH:mm:ss')}`}</p>
          <p className="text-green-500">{`Profit: $${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFiltersAndSort = () => {
    let filtered = [...sessions];

    if (filters.profitMin !== '') {
      filtered = filtered.filter(session => (session.cashOut - session.buyIn) >= parseFloat(filters.profitMin));
    }
    if (filters.profitMax !== '') {
      filtered = filtered.filter(session => (session.cashOut - session.buyIn) <= parseFloat(filters.profitMax));
    }
    if (filters.setting !== '') {
      filtered = filtered.filter(session => session.setting === filters.setting);
    }
    if (filters.gameType !== '') {
      filtered = filtered.filter(session => session.gameType === filters.gameType);
    }
    if (filters.stakes !== '') {
      filtered = filtered.filter(session => session.stakes === filters.stakes);
    }
    if (filters.sessionType !== '') {
      filtered = filtered.filter(session => session.sessionType === filters.sessionType);
    }
    if (filters.startDate && filters.endDate) {
      const start = parseISO(filters.startDate);
      const end = endOfDay(parseISO(filters.endDate));
      filtered = filtered.filter(session => 
        isWithinInterval(parseISO(session.startTime), { start, end })
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' ? new Date(a.startTime) - new Date(b.startTime) : new Date(b.startTime) - new Date(a.startTime);
      } else if (sortBy === 'profit') {
        const profitA = a.cashOut - a.buyIn;
        const profitB = b.cashOut - b.buyIn;
        return sortOrder === 'asc' ? profitA - profitB : profitB - profitA;
      } else if (sortBy === 'duration') {
        return sortOrder === 'asc' ? a.duration - b.duration : b.duration - a.duration;
      } else if (sortBy === 'profitPerHour') {
        const profitPerHourA = a.duration > 0 ? ((a.cashOut - a.buyIn) / a.duration) * 60 : 0;
        const profitPerHourB = b.duration > 0 ? ((b.cashOut - b.buyIn) / b.duration) * 60 : 0;
        return sortOrder === 'asc' ? profitPerHourA - profitPerHourB : profitPerHourB - profitPerHourA;
      }
      return 0;
    });

    setFilteredSessions(filtered);
  };

  const clearFilters = () => {
    setFilters({
      profitMin: '',
      profitMax: '',
      setting: '',
      gameType: '',
      stakes: '',
      sessionType: '',
      startDate: '',
      endDate: ''
    });
    setSortBy('date');
    setSortOrder('desc');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <ChevronLeft className="text-purple-500 cursor-pointer" onClick={() => navigate('/')} />
        <h2 className="text-2xl font-bold text-purple-500">Session History</h2>
        <div></div>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl">Overall Profit</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-purple-500 text-white px-4 py-2 rounded flex items-center"
          >
            <Filter size={18} className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        <p className={`text-2xl font-bold ${overallProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          ${overallProfit.toFixed(2)}
        </p>
        {showFilters && (
          <div className="bg-gray-800 p-4 rounded-lg mt-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Profit Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="profitMin"
                    value={filters.profitMin}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-full p-2 bg-gray-700 text-white rounded"
                  />
                  <input
                    type="number"
                    name="profitMax"
                    value={filters.profitMax}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="w-full p-2 bg-gray-700 text-white rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date Range</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="w-full p-2 bg-gray-700 text-white rounded"
                  />
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="w-full p-2 bg-gray-700 text-white rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Setting</label>
                <select
                  name="setting"
                  value={filters.setting}
                  onChange={handleFilterChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                >
                  <option value="">All</option>
                  <option value="In Person">In Person</option>
                  <option value="Online">Online</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Game Type</label>
                <select
                  name="gameType"
                  value={filters.gameType}
                  onChange={handleFilterChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                >
                  <option value="">All</option>
                  <option value="No Limit Hold'em">No Limit Hold'em</option>
                  <option value="Pot Limit Hold'em">Pot Limit Hold'em</option>
                  <option value="Omaha">Omaha</option>
                  <option value="DBBP Omaha">DBBP Omaha</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Stakes</label>
                <select
                  name="stakes"
                  value={filters.stakes}
                  onChange={handleFilterChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                >
                  <option value="">All</option>
                  <option value="0.10/0.20">0.10/0.20</option>
                  <option value="0.25/0.50">0.25/0.50</option>
                  <option value="0.5/1">0.5/1</option>
                  <option value="1/2">1/2</option>
                  <option value="2/3">2/3</option>
                  <option value="5/10">5/10</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Session Type</label>
                <select
                  name="sessionType"
                  value={filters.sessionType}
                  onChange={handleFilterChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                >
                  <option value="">All</option>
                  <option value="Cash">Cash</option>
                  <option value="Tournament">Tournament</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
                <div className="flex space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-2 bg-gray-700 text-white rounded"
                  >
                    <option value="date">Date</option>
                    <option value="profit">Profit</option>
                    <option value="duration">Duration</option>
                    <option value="profitPerHour">Profit/Hour</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="p-2 bg-gray-700 text-white rounded"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
              <div>
                <button
                  onClick={applyFiltersAndSort}
                  className="bg-purple-500 text-white px-4 py-2 rounded mr-2"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(date, 'MMM dd')}
                stroke="#718096"
              />
              <YAxis 
                stroke="#718096"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#8b5cf6" 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        {filteredSessions.map((session) => (
          <div key={session._id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold">
              {isValid(parseISO(session.startTime)) 
                  ? format(parseISO(session.startTime), 'MMM dd, yyyy')
                  : 'Invalid Date'}
              </span>
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
                <span className={`text-xl font-bold ${(session.cashOut - session.buyIn) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${(session.cashOut - session.buyIn).toFixed(2)}
                </span>
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
              <p>
                <GamepadIcon size={14} className="inline mr-1" />
                Game: {session.gameType} - Stakes: {session.stakes}
              </p>
              <p>
                <Monitor size={14} className="inline mr-1" />
                Setting: {session.setting}
              </p>
              <p>
                <Trophy size={14} className="inline mr-1" />
                Type: {session.sessionType}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {editingSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-gray-800 p-4 rounded-lg w-full max-w-2xl m-4">
            <h3 className="text-xl font-bold mb-4 text-purple-500">Edit Session</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  <DollarSign size={14} className="inline mr-1" />
                  Buy In
                </label>
                <input
                  type="number"
                  name="buyIn"
                  value={editingSession.buyIn}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  <DollarSign size={14} className="inline mr-1" />
                  Cash Out
                </label>
                <input
                  type="number"
                  name="cashOut"
                  value={editingSession.cashOut}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  <Clock size={14} className="inline mr-1" />
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={editingSession.duration}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  <GamepadIcon size={14} className="inline mr-1" />
                  Game Type
                </label>
                <select
                  name="gameType"
                  value={editingSession.gameType}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                >
                  <option>No Limit Hold'em</option>
                  <option>Pot Limit Hold'em</option>
                  <option>Omaha</option>
                  <option>DBBP Omaha</option>
                  <option value="Custom">Custom</option>
                </select>
                {editingSession.gameType === 'Custom' && (
                  <input
                    type="text"
                    name="customGameType"
                    value={editingSession.customGameType || ''}
                    onChange={handleChange}
                    className="w-full mt-2 p-2 bg-gray-700 text-white rounded"
                    placeholder="Enter custom game type"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  <DollarSign size={14} className="inline mr-1" />
                  Stakes
                </label>
                <select
                  name="stakes"
                  value={editingSession.stakes}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
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
                {editingSession.stakes === 'Custom' && (
                  <input
                    type="text"
                    name="customStakes"
                    value={editingSession.customStakes || ''}
                    onChange={handleChange}
                    className="w-full mt-2 p-2 bg-gray-700 text-white rounded"
                    placeholder="Enter custom stakes"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  <Monitor size={14} className="inline mr-1" />
                  Setting
                </label>
                <select
                  name="setting"
                  value={editingSession.setting}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                >
                  <option>In Person</option>
                  <option>Online</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  <Trophy size={14} className="inline mr-1" />
                  Session Type
                </label>
                <select
                  name="sessionType"
                  value={editingSession.sessionType}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                >
                  <option>Cash</option>
                  <option>Tournament</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Notes</label>
                <textarea
                  name="notes"
                  value={editingSession.notes}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                  rows="3"
                ></textarea>
              </div>
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