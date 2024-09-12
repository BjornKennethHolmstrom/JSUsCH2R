import React, { useState, useEffect } from 'react';
import { useTheme } from '../themes';

const JSUsCH2R = ({ schedule, onEmojiClick, onScheduleUpdate }) => {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [currentEmoji, setCurrentEmoji] = useState('');
  const { theme } = useTheme();

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
    <div className={`flex flex-col items-center justify-center ${theme.text}`}>
      {/* ... other elements remain the same */}
      <div className="grid grid-cols-6 gap-2">
        {schedule.map((item, index) => (
          <button 
            key={index}
            className={`text-2xl p-2 rounded ${index === currentHour ? theme.accent : theme.emojiBg} ${theme.hover}`}
            title={`${formatHourRange(index)}\n${item.activity}\nClick to edit`}
            onClick={() => onEmojiClick(index)}
          >
            {item.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};


export default JSUsCH2R;
