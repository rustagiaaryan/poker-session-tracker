import React, { useState } from 'react';

function SessionForm({ onStartSession }) {
  const [buyIn, setBuyIn] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onStartSession({ buyIn: parseFloat(buyIn) });
  };

  return (
    <div className="session-form">
      <h2>Start a Session</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={buyIn}
          onChange={(e) => setBuyIn(e.target.value)}
          placeholder="Enter Buy In Amount"
          required
        />
        <button type="submit">Start a Live Session</button>
      </form>
      <button onClick={() => {/* TODO: Implement completed session entry */}}>
        Add a Completed Session
      </button>
      <div>
        <button onClick={() => {/* TODO: Implement charts view */}}>Charts</button>
        <button onClick={() => {/* TODO: Implement share functionality */}}>Share App</button>
      </div>
    </div>
  );
}

export default SessionForm;