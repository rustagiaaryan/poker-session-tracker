import React from 'react';

function Dashboard({ sessions }) {
  const totalProfit = sessions.reduce((sum, session) => 
    sum + (session.endAmount - session.buyIn), 0
  );

  const totalHours = sessions.reduce((sum, session) => 
    sum + (new Date(session.endTime) - new Date(session.startTime)) / 3600000, 0
  );

  const hourlyRate = totalHours > 0 ? totalProfit / totalHours : 0;

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Total Sessions: {sessions.length}</p>
      <p>Total Profit: ${totalProfit.toFixed(2)}</p>
      <p>Total Hours Played: {totalHours.toFixed(2)}</p>
      <p>Hourly Rate: ${hourlyRate.toFixed(2)}/hour</p>
    </div>
  );
}

export default Dashboard;