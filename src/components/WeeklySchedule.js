import React, { useState, useEffect } from 'react';
import { useTheme } from '../themes';
import JSUsCH2R from './JSUsCH2R';

const WeeklySchedule = ({ weekSchedule, onDayScheduleUpdate, onEmojiClick, weekStart, showTooltip, onTooltipDismiss }) => {
  const { theme } = useTheme();
  const [activeDay, setActiveDay] = useState(weekStart);

  const DAYS = weekStart === 'Mon' 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    setActiveDay(weekStart);
  }, [weekStart]);

  const handleEmojiClick = (index) => {
    onEmojiClick(activeDay, index);
  };

  return (
    <div className={`${theme.card} rounded-lg shadow-lg p-6 mt-8 relative`}>
      {showTooltip && (
        <div className={`absolute top-2 right-2 ${theme.text} text-sm bg-yellow-100 p-2 rounded shadow`}>
          This is a sample schedule. Customize it to fit your lifestyle!
          <button 
            className="ml-2 text-xs underline"
            onClick={onTooltipDismiss}
          >
            Got it
          </button>
        </div>
      )}
      <div className="flex mb-4">
        {DAYS.map(day => (
          <button
            key={day}
            className={`flex-1 py-2 ${activeDay === day ? theme.accent : ''} ${theme.hover}`}
            onClick={() => setActiveDay(day)}
          >
            {day}
          </button>
        ))}
      </div>
      <JSUsCH2R
        schedule={weekSchedule[activeDay]}
        onEmojiClick={handleEmojiClick}
        onScheduleUpdate={(newSchedule) => onDayScheduleUpdate(activeDay, newSchedule)}
      />
    </div>
  );
};

export default WeeklySchedule;
