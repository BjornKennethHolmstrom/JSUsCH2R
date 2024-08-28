import React, { useState, useEffect } from 'react';

const JSUsCH2R = ({ schedule, onEmojiClick }) => {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [currentEmoji, setCurrentEmoji] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentHour(now.getHours());
      setCurrentEmoji(schedule[now.getHours()]?.emoji || '⏺');
    }, 1000);

    return () => clearInterval(timer);
  }, [schedule]);

  const formatHourRange = (index) => {
    const start = index.toString().padStart(2, '0');
    const end = ((index + 1) % 24).toString().padStart(2, '0');
    return `${start}:00 - ${end}:00`;
  };

  return (
    <div className="flex flex-col items-center justify-center bg-[#7FD4F5] text-gray-800 p-4">
      <h1 className="text-4xl font-bold mb-2">JSUsCH²R</h1>
      <p className="text-sm mb-4 text-center">
        by <a href="https://bjornkennethholmstrom.wordpress.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Björn Kenneth Holmström</a>
      </p>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
        <p className="text-lg mb-2">JavaScriptUnicodeSymbolClockHourlyHabitRepresentation</p>
        <p className="text-sm mb-4 italic">This is just an excuse to make a funny acronym.</p>
        <p className="mb-4">Shows Unicode symbols representing human activity</p>
        <div className="text-6xl mb-4">{currentEmoji}</div>
        <p className="text-xl mb-4">Current Time: {new Date().toLocaleTimeString()}</p>
        <div className="grid grid-cols-6 gap-2">
          {schedule.map((item, index) => (
            <button 
              key={index}
              className={`text-2xl p-2 rounded ${index === currentHour ? 'bg-yellow-300' : 'bg-gray-200'} hover:bg-blue-200`}
              title={`${formatHourRange(index)}\n${item.activity}\nClick to edit`}
              onClick={() => onEmojiClick(index)}
            >
              {item.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JSUsCH2R;
