import React, { useState, useEffect } from 'react';
import { useTheme } from '../themes';
import JSUsCH2R from './JSUsCH2R';
import { Lock, Share2, Users } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { saveSchedule, getSchedule, getSchedules, getPublicSchedules } from '../services/api';
import Notification from './Notification';

const WeeklySchedule = ({ 
  weekSchedule, 
  onDayScheduleUpdate, 
  onEmojiClick, 
  weekStart, 
  showTooltip, 
  onTooltipDismiss, 
  onOpenHelpModal, 
  onActiveDayChange,
  isAuthenticated,
  userId,
  currentLibraryId,
  visibility,
  setVisibility,
  sharedWith,
  setSharedWith
}) => {
  const { theme } = useTheme();
  const [activeDay, setActiveDay] = useState(weekStart);
  const [showTimeLabels, setShowTimeLabels] = useState(() => {
    const stored = localStorage.getItem('jsusch2r-show-time-labels');
    return stored !== null ? JSON.parse(stored) : true;
  });
  const [schedules, setSchedules] = useState([]);
  const [scheduleName, setScheduleName] = useState('My Schedule');


  useEffect(() => {
    localStorage.setItem('jsusch2r-show-time-labels', JSON.stringify(showTimeLabels));
  }, [showTimeLabels]);

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchUserSchedules();
    } else if (process.env.NODE_ENV === 'development') {
      console.log('User not authenticated or user ID is undefined, skipping fetch');
    }
  }, [isAuthenticated, userId]);

  const DAYS = weekStart === 'Mon' 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    setActiveDay(weekStart);
  }, [weekStart]);

  useEffect(() => {
    onActiveDayChange(activeDay);
  }, [activeDay, onActiveDayChange]);

  const fetchUserSchedules = async () => {
    try {
      const userSchedules = await getSchedules(userId);
      // Handle the fetched schedules
    } catch (error) {
      console.error('Error fetching user schedules:', error);
      Notification('Failed to fetch schedules', 'error');
    }
  };

  const handleSaveSchedule = async () => {
    if (!isAuthenticated) {
      alert('Please log in to save your schedule');
      return;
    }
    try {
      await saveSchedule(userId, currentLibraryId, scheduleName, weekSchedule, visibility, sharedWith);
      fetchUserSchedules();
      alert('Schedule saved successfully!');
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Failed to save schedule. Please try again.');
    }
  };

  const handleLoadSchedule = async (scheduleId) => {
    if (!isAuthenticated) {
      alert('Please log in to load a schedule');
      return;
    }
    try {
      const loadedSchedule = await getSchedule(scheduleId);
      onDayScheduleUpdate(loadedSchedule.week_data);
      setScheduleName(loadedSchedule.name);
      setVisibility(loadedSchedule.visibility);
    } catch (error) {
      console.error('Error loading schedule:', error);
      alert('Failed to load schedule. Please try again.');
    }
  };

  const handleSearchPublicSchedules = async (searchTerm) => {
    try {
      const publicSchedules = await getPublicSchedules(searchTerm);
      // You can display these public schedules in a modal or a separate component
      console.log(publicSchedules);
    } catch (error) {
      console.error('Error searching public schedules:', error);
    }
  };

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

  const handleToggleVisibility = () => {
    const visibilityOrder = ['private', 'public', 'shared'];
    const currentIndex = visibilityOrder.indexOf(visibility);
    const nextIndex = (currentIndex + 1) % visibilityOrder.length;
    setVisibility(visibilityOrder[nextIndex]);
  };

  const renderVisibilityIcon = () => {
    switch (visibility) {
      case 'private':
        return <Lock size={20} />;
      case 'public':
        return <Share2 size={20} />;
      case 'shared':
        return <Users size={20} />;
      default:
        return <Lock size={20} />;
    }
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
        {isAuthenticated && (
          <button
            onClick={handleToggleVisibility}
            className={`${theme.accent} ${theme.text} p-2 rounded ${theme.hover}`}
            title={`Visibility: ${visibility}`}
          >
            {renderVisibilityIcon()}
          </button>
        )}
        <button
          onClick={onOpenHelpModal}
          className={`ml-2 ${theme.accent} ${theme.text} px-2 py-1 rounded ${theme.hover} text-sm`}
        >
          ?
        </button>
      </div>

      {isAuthenticated && visibility === 'shared' && (
        <div className="mb-4">
          <input
            type="text"
            value={sharedWith.join(', ')}
            onChange={(e) => setSharedWith(e.target.value.split(',').map(email => email.trim()))}
            className={`border rounded p-2 w-full ${theme.input}`}
            placeholder="Enter email addresses to share with, separated by commas"
          />
        </div>
      )}
      {isAuthenticated && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              className={`border rounded p-2 flex-grow ${theme.input}`}
              placeholder="Schedule Name"
            />
            <button
              onClick={handleSaveSchedule}
              className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover}`}
            >
              Save Schedule
            </button>
          </div>
        </div>
      )}

      {isAuthenticated && schedules.length > 0 && (
        <div className="mb-4">
          <select
            onChange={(e) => handleLoadSchedule(e.target.value)}
            className={`border rounded p-2 w-full ${theme.input}`}
          >
            <option value="">Select a schedule to load</option>
            {schedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {schedule.name}
              </option>
            ))}
          </select>
        </div>
      )}
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
          schedule={weekSchedule[activeDay] || []}
          onEmojiClick={handleEmojiClick}
          onScheduleUpdate={(newSchedule) => onDayScheduleUpdate(activeDay, newSchedule)}
          showTimeLabels={showTimeLabels}
          activeDay={activeDay}
        />
      </div>
      {isAuthenticated && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search public schedules"
            onChange={(e) => handleSearchPublicSchedules(e.target.value)}
            className={`border rounded p-2 w-full ${theme.input}`}
          />
        </div>
      )}
    </div>
  );
};

export default WeeklySchedule;
