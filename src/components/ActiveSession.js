import React, { useState, useEffect } from 'react';

function ActiveSession({ sessionData, onEndSession }) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [buyIns, setBuyIns] = useState([{ amount: sessionData.buyIn, count: 1 }]);
  const [tips, setTips] = useState(0);
  const [gameType, setGameType] = useState('Texas Hold\'em');
  const [limit, setLimit] = useState('No Limit');

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
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddBuyIn = () => {
    const newBuyIn = prompt('Enter additional buy-in amount:');
    if (newBuyIn) {
      setBuyIns([...buyIns, { amount: parseFloat(newBuyIn), count: 1 }]);
    }
  };

  const handleEndSession = () => {
    const cashOut = prompt('Enter your cash out amount:');
    if (cashOut) {
      onEndSession({
        buyIns,
        tips,
        gameType,
        limit,
        duration: elapsedTime,
        cashOut: parseFloat(cashOut),
      });
    }
  };

  return (
    <div className="active-session">
      <div className="timer">
        {formatTime(elapsedTime)}
        <button onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? 'Pause' : 'Resume'}
        </button>
        <button onClick={handleEndSession}>Finish</button>
      </div>
      <div className="session-details">
        <div>
          Buy-Ins: ${buyIns.reduce((sum, buyIn) => sum + buyIn.amount * buyIn.count, 0)}
          <button onClick={handleAddBuyIn}>+</button>
        </div>
        <div>
          Tips & Expenses: ${tips}
          <button onClick={() => {
            const newTip = prompt('Enter tip or expense amount:');
            if (newTip) setTips(tips + parseFloat(newTip));
          }}>+</button>
        </div>
        <div>
          Game Type: {gameType}
          <button onClick={() => {/* TODO: Implement game type selection */}}>Edit</button>
        </div>
        <div>
          Limit: {limit}
          <button onClick={() => {/* TODO: Implement limit selection */}}>Edit</button>
        </div>
        {/* TODO: Add more fields like Stakes, Session Type, Notes, Location, etc. */}
      </div>
    </div>
  );
}

export default ActiveSession;