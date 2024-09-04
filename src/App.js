import './App.css';
import React, { useState, useEffect } from 'react';
import { Settings, Award, Home, PlusCircle, BarChart2, User, ChevronLeft, PauseCircle, PlayCircle } from 'lucide-react';

const App = () => {
  const [screen, setScreen] = useState('home');
  const [buyIn, setBuyIn] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const startLiveSession = () => {
    if (buyIn && !isNaN(buyIn)) {
      setActiveSession({ buyIn: parseFloat(buyIn), startTime: new Date() });
      setScreen('activeSession');
      setIsRunning(true);
    } else {
      alert('Please enter a valid buy-in amount');
    }
  };

  const endSession = () => {
    const cashOut = prompt('Enter your cash out amount:');
    if (cashOut && !isNaN(cashOut)) {
      const profit = parseFloat(cashOut) - activeSession.buyIn;
      alert(`Session ended. Profit: $${profit.toFixed(2)}`);
      setActiveSession(null);
      setScreen('home');
      setElapsedTime(0);
      setIsRunning(false);
      setBuyIn('');
    } else {
      alert('Please enter a valid cash out amount');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4">
        {screen === 'activeSession' ? (
          <ChevronLeft className="text-gray-400 w-6 h-6 cursor-pointer" onClick={() => setScreen('home')} />
        ) : (
          <Settings className="text-gray-400 w-6 h-6" />
        )}
        {screen === 'activeSession' && <div className="text-purple-500 text-xl">{formatTime(elapsedTime)}</div>}
        <Award className="text-purple-500 w-6 h-6" />
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        {screen === 'home' && (
          <>
            <h1 className="text-5xl font-bold text-purple-500 mb-8">FLOP</h1>
            <h2 className="text-2xl mb-6">Start a Session</h2>
            <input
              type="number"
              value={buyIn}
              onChange={(e) => setBuyIn(e.target.value)}
              placeholder="Enter Buy In Amount"
              className="w-full max-w-xs p-3 mb-6 bg-gray-800 text-white rounded-lg text-center text-xl"
            />
            <button 
              className="w-full max-w-xs p-3 mb-4 bg-purple-600 text-white rounded-lg text-xl"
              onClick={startLiveSession}
            >
              Start a Live Session
            </button>
            <button className="w-full max-w-xs p-3 mb-4 bg-purple-600 text-white rounded-lg text-xl">
              Add a Completed Session
            </button>
          </>
        )}
        {screen === 'activeSession' && (
          <div className="w-full max-w-xs">
            <h2 className="text-2xl mb-6 text-center">Active Session</h2>
            <p className="text-xl mb-4">Buy In: ${activeSession.buyIn}</p>
            <button 
              className="w-full p-3 mb-4 bg-purple-600 text-white rounded-lg text-xl"
              onClick={endSession}
            >
              End Session
            </button>
          </div>
        )}
      </main>

      <footer className="flex justify-around items-center p-4 bg-gray-800">
        <Home className="text-gray-400 w-6 h-6" onClick={() => setScreen('home')} />
        <PlusCircle className="text-gray-400 w-6 h-6" />
        <div className="bg-purple-600 rounded-full p-3" onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? (
            <PauseCircle className="text-white w-6 h-6" />
          ) : (
            <PlayCircle className="text-white w-6 h-6" />
          )}
        </div>
        <BarChart2 className="text-gray-400 w-6 h-6" />
        <User className="text-gray-400 w-6 h-6" />
      </footer>
    </div>
  );
};

export default App;