import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, isValid, parseISO, isWithinInterval, endOfDay } from 'date-fns';
import { Filter, ChevronLeft, DollarSign, Clock, TrendingUp, GamepadIcon, Monitor } from 'lucide-react';
import SessionDetailsModal from './SessionDetailsModal';
import { deleteSession } from '../services/api';

const SessionHistory = ({ sessions, onUpdateSession, fetchSessions }) => {
  const navigate = useNavigate();
  const [graphData, setGraphData] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [error, setError] = useState(null);
  const [overallProfit, setOverallProfit] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({
    profitMin: '',
    profitMax: '',
    setting: '',
    gameType: '',
    stakes: '',
    sessionType: '',
    startDate: '',
    endDate: '',
    sessionName: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    profitMin: '',
    profitMax: '',
    setting: '',
    gameType: '',
    stakes: '',
    sessionType: '',
    startDate: '',
    endDate: '',
    sessionName: ''
  });
  const [currentSortBy, setCurrentSortBy] = useState('startTime');
  const [currentSortOrder, setCurrentSortOrder] = useState('desc');
  const [appliedSortBy, setAppliedSortBy] = useState('startTime');
  const [appliedSortOrder, setAppliedSortOrder] = useState('desc');
  const [filteredSessions, setFilteredSessions] = useState(sessions);
  const [customGameType, setCustomGameType] = useState('');
  const [customStakes, setCustomStakes] = useState('');
  const [subtractTipsFromProfit, setSubtractTipsFromProfit] = useState(false);

  useEffect(() => {
    updateGraphData(filteredSessions);
    calculateOverallProfit(filteredSessions);
  }, [filteredSessions, subtractTipsFromProfit]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [sessions, appliedFilters, appliedSortBy, appliedSortOrder, subtractTipsFromProfit]);

  const updateGraphData = (sessionData) => {
    let cumulativeProfit = 0;
    const data = sessionData
      .filter(session => isValid(parseISO(session.startTime)))
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .map(session => {
        const profit = subtractTipsFromProfit
          ? session.cashOut - session.buyIn - (session.tip || 0)
          : session.cashOut - session.buyIn;
        cumulativeProfit += profit;
        return {
          date: parseISO(session.startTime),
          profit: cumulativeProfit
        };
      });
    setGraphData(data);
  };

  const calculateOverallProfit = (sessionData) => {
    const totalProfit = sessionData.reduce((sum, session) => {
      const sessionProfit = subtractTipsFromProfit
        ? session.cashOut - session.buyIn - (session.tip || 0)
        : session.cashOut - session.buyIn;
      return sum + sessionProfit;
    }, 0);
    setOverallProfit(totalProfit);
  };

  const handleUpdateSession = async (sessionId, updatedSessionData) => {
    try {
      await onUpdateSession(sessionId, updatedSessionData);
      setSelectedSession(null);
      fetchSessions();
    } catch (error) {
      console.error('Failed to update session', error);
      setError('Failed to update session. Please try again.');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteSession(sessionId);
      setSelectedSession(null);
      fetchSessions();
    } catch (error) {
      console.error('Failed to delete session', error);
      setError(`Failed to delete session: ${error.message}`);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const calculateProfitPerHour = (session) => {
    const profit = subtractTipsFromProfit
      ? session.cashOut - session.buyIn - (session.tip || 0)
      : session.cashOut - session.buyIn;
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
    const { name, value } = e.target;
    setCurrentFilters({ ...currentFilters, [name]: value });
    if (name === 'gameType' && value !== 'Custom') {
      setCustomGameType('');
    }
    if (name === 'stakes' && value !== 'Custom') {
      setCustomStakes('');
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...sessions];

    if (appliedFilters.profitMin !== '') {
      filtered = filtered.filter(session => {
        const profit = subtractTipsFromProfit
          ? session.cashOut - session.buyIn - (session.tip || 0)
          : session.cashOut - session.buyIn;
        return profit >= parseFloat(appliedFilters.profitMin);
      });
    }
    if (appliedFilters.profitMax !== '') {
      filtered = filtered.filter(session => {
        const profit = subtractTipsFromProfit
          ? session.cashOut - session.buyIn - (session.tip || 0)
          : session.cashOut - session.buyIn;
        return profit <= parseFloat(appliedFilters.profitMax);
      });
    }
    if (appliedFilters.setting !== '') {
      filtered = filtered.filter(session => session.setting === appliedFilters.setting);
    }
    if (appliedFilters.gameType !== '') {
      if (appliedFilters.gameType === 'Custom') {
        filtered = filtered.filter(session => session.gameType === customGameType);
      } else {
        filtered = filtered.filter(session => session.gameType === appliedFilters.gameType);
      }
    }
    if (appliedFilters.stakes !== '') {
      if (appliedFilters.stakes === 'Custom') {
        filtered = filtered.filter(session => session.stakes === customStakes);
      } else {
        filtered = filtered.filter(session => session.stakes === appliedFilters.stakes);
      }
    }
    if (appliedFilters.sessionType !== '') {
      filtered = filtered.filter(session => session.sessionType === appliedFilters.sessionType);
    }
    if (appliedFilters.startDate && appliedFilters.endDate) {
      const start = parseISO(appliedFilters.startDate);
      const end = endOfDay(parseISO(appliedFilters.endDate));
      filtered = filtered.filter(session => 
        isWithinInterval(parseISO(session.startTime), { start, end })
      );
    }
    if (appliedFilters.sessionName !== '') {
      filtered = filtered.filter(session => 
        session.sessionName && session.sessionName.toLowerCase().includes(appliedFilters.sessionName.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      if (appliedSortBy === 'date') {
        return appliedSortOrder === 'asc' ? new Date(a.startTime) - new Date(b.startTime) : new Date(b.startTime) - new Date(a.startTime);
      } else if (appliedSortBy === 'profit') {
        const profitA = subtractTipsFromProfit ? a.cashOut - a.buyIn - (a.tip || 0) : a.cashOut - a.buyIn;
        const profitB = subtractTipsFromProfit ? b.cashOut - b.buyIn - (b.tip || 0) : b.cashOut - b.buyIn;
        return appliedSortOrder === 'asc' ? profitA - profitB : profitB - profitA;
      } else if (appliedSortBy === 'duration') {
        return appliedSortOrder === 'asc' ? a.duration - b.duration : b.duration - a.duration;
      } else if (appliedSortBy === 'profitPerHour') {
        const profitPerHourA = calculateProfitPerHour(a);
        const profitPerHourB = calculateProfitPerHour(b);
        return appliedSortOrder === 'asc' ? profitPerHourA - profitPerHourB : profitPerHourB - profitPerHourA;
      } else if (appliedSortBy === 'tips') {
        const tipA = a.tip || 0;
        const tipB = b.tip || 0;
        return appliedSortOrder === 'asc' ? tipA - tipB : tipB - tipA;
      }
      return 0;
    });

    setFilteredSessions(filtered);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      ...currentFilters,
      gameType: currentFilters.gameType === 'Custom' ? customGameType : currentFilters.gameType,
      stakes: currentFilters.stakes === 'Custom' ? customStakes : currentFilters.stakes,
    });
    setAppliedSortBy(currentSortBy);
    setAppliedSortOrder(currentSortOrder);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const emptyFilters = {
      profitMin: '',
      profitMax: '',
      setting: '',
      gameType: '',
      stakes: '',
      sessionType: '',
      startDate: '',
      endDate: '',
      sessionName: ''
    };
    setCurrentFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentSortBy('startTime');
    setCurrentSortOrder('desc');
    setAppliedSortBy('startTime');
    setAppliedSortOrder('desc');
    setCustomGameType('');
    setCustomStakes('');
    setSubtractTipsFromProfit(false);
  };

  const gameTypeOptions = ['No Limit Hold\'em', 'Pot Limit Hold\'em', 'Omaha', 'DBBP Omaha', 'Custom'];
  const stakesOptions = ['0.10/0.20', '0.25/0.50', '0.5/1', '1/2', '2/3', '5/10', '10/20', '25/50', '100/200', 'Custom'];

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
                    value={currentFilters.profitMin}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-full p-2 bg-gray-700 text-white rounded"
                  />
                  <input
                    type="number"
                    name="profitMax"
                    value={currentFilters.profitMax}
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
                    value={currentFilters.startDate}
                    onChange={handleFilterChange}
                    className="w-full p-2 bg-gray-700 text-white rounded"
                  />
                  <input
                    type="date"
                    name="endDate"
                    value={currentFilters.endDate}
                    onChange={handleFilterChange}
                    className="w-full p-2 bg-gray-700 text-white rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Setting</label>
                <select
                  name="setting"
                  value={currentFilters.setting}
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
                  value={currentFilters.gameType}
                  onChange={handleFilterChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                >
                  <option value="">All</option>
                  {gameTypeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {currentFilters.gameType === 'Custom' && (
                  <input
                    type="text"
                    value={customGameType}
                    onChange={(e) => setCustomGameType(e.target.value)}
                    placeholder="Enter custom game type"
                    className="w-full p-2 bg-gray-700 text-white rounded mt-2"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Stakes</label>
                <select
                  name="stakes"
                  value={currentFilters.stakes}
                  onChange={handleFilterChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                >
                  <option value="">All</option>
                  {stakesOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {currentFilters.stakes === 'Custom' && (
                  <input
                    type="text"
                    value={customStakes}
                    onChange={(e) => setCustomStakes(e.target.value)}
                    placeholder="Enter custom stakes"
                    className="w-full p-2 bg-gray-700 text-white rounded mt-2"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Session Type</label>
                <select
                  name="sessionType"
                  value={currentFilters.sessionType}
                  onChange={handleFilterChange}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                >
                  <option value="">All</option>
                  <option value="Cash">Cash</option>
                  <option value="Tournament">Tournament</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Session Name</label>
                <input
                  type="text"
                  name="sessionName"
                  value={currentFilters.sessionName}
                  onChange={handleFilterChange}
                  placeholder="Search by session name"
                  className="w-full p-2 bg-gray-700 text-white rounded"
                />
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
                <div className="flex space-x-2">
                  <select
                    value={currentSortBy}
                    onChange={(e) => setCurrentSortBy(e.target.value)}
                    className="p-2 bg-gray-700 text-white rounded"
                  >
                    <option value="date">Date</option>
                    <option value="profit">Profit</option>
                    <option value="duration">Duration</option>
                    <option value="profitPerHour">Profit/Hour</option>
                    <option value="tips">Tips</option>
                  </select>
                  <select
                    value={currentSortOrder}
                    onChange={(e) => setCurrentSortOrder(e.target.value)}
                    className="p-2 bg-gray-700 text-white rounded"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex items-center text-sm font-medium text-gray-400 mr-4">
                  <input
                    type="checkbox"
                    checked={subtractTipsFromProfit}
                    onChange={() => setSubtractTipsFromProfit(!subtractTipsFromProfit)}
                    className="mr-2 form-checkbox h-5 w-5 text-purple-600"
                  />
                  <span>Subtract Tips from Profit</span>
                </label>
                <button
                  onClick={handleApplyFilters}
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

      {filteredSessions.length === 0 ? (
        <div className="text-center text-gray-400 mt-8">
          <p>No sessions found. Your sessions will appear here with a graph once you add them.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div 
              key={session._id} 
              className="bg-gray-800 rounded-lg p-4 cursor-pointer transform transition duration-200 hover:scale-1 hover:shadow-lg hover:bg-gray-700"
              onClick={() => setSelectedSession(session)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold">
                  {session.sessionName ? `${session.sessionName} - ` : ''}
                  {isValid(parseISO(session.startTime)) 
                    ? format(parseISO(session.startTime), 'MMM dd, yyyy')
                    : 'Invalid Date'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center text-gray-400 mb-1">
                    <DollarSign size={16} className="mr-1" />
                    <span>Profit</span>
                  </div>
                  <span className={`text-xl font-bold ${(session.cashOut - session.buyIn - (subtractTipsFromProfit ? (session.tip || 0) : 0)) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${(session.cashOut - session.buyIn - (subtractTipsFromProfit ? (session.tip || 0) : 0)).toFixed(2)}
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
                {session.tip > 0 && (
                  <p>
                    <DollarSign size={14} className="inline mr-1" />
                    Tip: ${session.tip.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onUpdate={handleUpdateSession}
          onDelete={handleDeleteSession}
        />
      )}
    </div>
  );
};

export default SessionHistory;