import React from 'react';

function SessionList({ sessions }) {
  return (
    <div>
      <h2>Session History</h2>
      <ul>
        {sessions.map((session, index) => (
          <li key={index}>
            {session.sessionName} - {session.pokerStyle} - 
            Profit: ${session.endAmount - session.buyIn}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SessionList;