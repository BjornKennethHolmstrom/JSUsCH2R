import React, { useState, useEffect } from 'react';
import { useTheme } from '../themes';

const JSUsCH2R = ({ schedule, onEmojiClick, onScheduleUpdate, showTimeLabels, activeDay }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const currentDay = currentTime.toLocaleString('en-US', {weekday: 'short'});
  const currentEmoji = schedule && schedule[currentHour] ? schedule[currentHour].emoji : '⏺';

  const formatHourRange = (index) => {
    const start = index.toString().padStart(2, '0');
    const end = ((index + 1) % 24).toString().padStart(2, '0');
    return `${start}:00 - ${end}:00`;
  };

  const isCurrentTimeSlot = (index) => {
    return currentDay === activeDay && index === currentHour;
  };

  // Ensure schedule is an array with 24 items
  const safeSchedule = Array.isArray(schedule) && schedule.length === 24
    ? schedule
    : Array(24).fill({ emoji: '⏺', activity: 'Not set' });

  return (
    <div className={`flex flex-col items-center justify-center ${theme.text}`}>
      <div className="text-6xl mb-4">{currentEmoji}</div>
      <p className="text-xl mb-4">Current Time: {currentTime.toLocaleTimeString()}</p>
      <div className="grid grid-cols-6 gap-2">
        {safeSchedule.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <button 
              className={`text-2xl p-2 rounded ${isCurrentTimeSlot(index) ? theme.accent : theme.emojiBg} ${theme.hover}`}
              title={`${formatHourRange(index)}\n${item.activity}\nClick to edit`}
              onClick={() => onEmojiClick(index)}
            >
              {item.emoji}
            </button>
            {(showTimeLabels || showTimeLabels === undefined) && (
              <span className={`text-xs mt-1 ${theme.text}`}>
                {index.toString().padStart(2, '0')}:00
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JSUsCH2R;
