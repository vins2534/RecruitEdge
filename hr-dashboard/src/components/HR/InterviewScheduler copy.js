// src/components/HR/InterviewScheduler.js
import React, { useState } from 'react';

const InterviewScheduler = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [message, setMessage] = useState('');

  const handleSchedule = (event) => {
    event.preventDefault();
    // Placeholder: simulate scheduling
    setMessage(`Interview scheduled on ${selectedDate} (placeholder)`);
  };

  return (
    <div>
      <h2>Interview Scheduler (HR)</h2>
      <form onSubmit={handleSchedule}>
        <input
          type="datetime-local"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button type="submit">Schedule Interview</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default InterviewScheduler;
