import React, { useState, useEffect } from 'react';
import { useTheme } from '../themes';
import JSUsCH2R from './JSUsCH2R';
import { useSwipeable } from 'react-swipeable';

const WeeklySchedule = ({ weekSchedule, onDayScheduleUpdate, onEmojiClick, weekStart, showTooltip, onTooltipDismiss, onOpenHelpModal, onActiveDayChange }) => {
  const { theme } = useTheme();
  const [activeDay, setActiveDay] = useState(weekStart);
  const [showTimeLabels, setShowTimeLabels] = useState(() => {
    const stored = localStorage.getItem('jsusch2r-show-time-labels');
    return stored !== null ? JSON.parse(stored) : true;
  });

  useEffect(() => {
    localStorage.setItem('jsusch2r-show-time-labels', JSON.stringify(showTimeLabels));
  }, [showTimeLabels]);

  const DAYS = weekStart === 'Mon' 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    setActiveDay(weekStart);
  }, [weekStart]);

  useEffect(() => {
    onActiveDayChange(activeDay);
  }, [activeDay, onActiveDayChange]);

  const handleEmojiClick = (index) => {
    onEmojiClick(activeDay, index);
  };

  const handlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      eventData.event.preventDefault();
      setShowTimeLabels(true);
    },
    onSwipedRight: (eventData) => {
      eventData.event.preventDefault();
      setShowTimeLabels(false);
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const handleDayChange = (day) => {
    setActiveDay(day);
    onActiveDayChange(day);
  };

  return (
    <div className={`${theme.card} rounded-lg shadow-lg p-6 mt-8 relative`}>
      {showTooltip && (
        <div className={`absolute top-2 right-2 ${theme.modalBackground} ${theme.text} text-sm p-2 rounded shadow`}>
          This is a sample schedule. Customize it to fit your lifestyle!
          <button 
            className={`ml-2 text-xs underline ${theme.accent}`}
            onClick={onTooltipDismiss}
          >
            Got it
          </button>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-1">
          {DAYS.map(day => (
            <button
              key={day}
              className={`flex-1 py-2 ${activeDay === day ? theme.accent : ''} ${theme.hover}`}
              onClick={() => handleDayChange(day)}
            >
              {day}
            </button>
          ))}
        </div>
        <button
          onClick={onOpenHelpModal}
          className={`ml-2 ${theme.accent} ${theme.text} px-2 py-1 rounded ${theme.hover} text-sm`}
        >
          ?
        </button>
      </div>
      <div {...handlers} className="overflow-hidden touch-none">
        <div className="hidden sm:block mb-2">
          <button
            onClick={() => setShowTimeLabels(!showTimeLabels)}
            className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover}`}
          >
            {showTimeLabels ? 'Hide Time Labels' : 'Show Time Labels'}
          </button>
        </div>
        <JSUsCH2R
          schedule={weekSchedule[activeDay]}
          onEmojiClick={handleEmojiClick}
          onScheduleUpdate={(newSchedule) => onDayScheduleUpdate(activeDay, newSchedule)}
          showTimeLabels={showTimeLabels}
          activeDay={activeDay}
        />
      </div>
    </div>
  );
};

export default WeeklySchedule;
