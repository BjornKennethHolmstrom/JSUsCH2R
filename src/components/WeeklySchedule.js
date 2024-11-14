import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../themes';
import JSUsCH2R from './JSUsCH2R';
import { Lock, Share2, Users } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { saveSchedule, getSchedule, getSchedules, updateSchedule, getPublicSchedules } from '../services/api';
import Notification from './Notification';
import { clearIndexedDB } from '../utils/indexedDB';
import { useAuth } from '../AuthContext';
import EditPopup from './EditPopup'; 

const WeeklySchedule = ({ 
  weekSchedule, 
  onDayScheduleUpdate, 
  onEmojiClick, 
  weekStart, 
  showTooltip, 
  onTooltipDismiss, 
  onOpenHelpModal, 
  onActiveDayChange,
  visibility,
  setVisibility,
  sharedWith,
  setSharedWith,
  emojiLibrary,
}) => {
  const { theme } = useTheme();
  const { isAuthenticated, userId } = useAuth();
  const [activeDay, setActiveDay] = useState(weekStart);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showTimeLabels, setShowTimeLabels] = useState(() => {
    const stored = localStorage.getItem('jsusch2r-show-time-labels');
    return stored !== null ? JSON.parse(stored) : true;
  });
  const [schedules, setSchedules] = useState([]);
  const [scheduleName, setScheduleName] = useState('My Schedule');
  const [currentScheduleId, setCurrentScheduleId] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
  }, []);


  const DAYS = weekStart === 'Mon' 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const clearLocalData = useCallback(async () => {
    try {
      localStorage.removeItem('jsusch2r-week-schedule');
      await clearIndexedDB();
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  }, []);

  const handleSaveSchedule = async () => {
    if (!isAuthenticated) {
      showNotification('Please log in to save your schedule', 'error');
      return;
    }

    try {
      const scheduleData = {
        name: scheduleName,
        weekData: weekSchedule,
        visibility: visibility || 'private',
        sharedWith: sharedWith || []
      };

      const savedSchedule = await saveSchedule(scheduleData);
      setCurrentScheduleId(savedSchedule.id);
      
      await fetchUserSchedules();
      await clearLocalData();
      
      showNotification('New schedule saved successfully');
    } catch (error) {
      console.error('Error saving schedule:', error);
      showNotification(`Failed to save schedule: ${error.message}`, 'error');
    }
  };

  const handleUpdateSchedule = async () => {
    if (!isAuthenticated || !currentScheduleId) {
      showNotification('Cannot update schedule', 'error');
      return;
    }

    try {
      const scheduleData = {
        name: scheduleName,
        weekData: weekSchedule,
        visibility: visibility || 'private',
        sharedWith: sharedWith || []
      };

      await updateSchedule(currentScheduleId, scheduleData);
      await fetchUserSchedules();
      await clearLocalData();
      
      showNotification('Schedule updated successfully');
    } catch (error) {
      console.error('Error updating schedule:', error);
      showNotification(`Failed to update schedule: ${error.message}`, 'error');
    }
  };

  const handleLoadSchedule = async (scheduleId) => {
    if (!scheduleId) return;
    
    try {
      const loadedSchedule = await getSchedule(scheduleId);
      
      if (!loadedSchedule.week_data) {
        throw new Error('Invalid schedule data received');
      }

      const weekData = typeof loadedSchedule.week_data === 'string' 
        ? JSON.parse(loadedSchedule.week_data)
        : loadedSchedule.week_data;

      onDayScheduleUpdate(weekData);
      setScheduleName(loadedSchedule.name || 'My Schedule');
      setVisibility(loadedSchedule.visibility || 'private');
      setSharedWith(loadedSchedule.shared_with || []);
      setCurrentScheduleId(loadedSchedule.id);
      
      await clearLocalData();
      showNotification('Schedule loaded successfully');
    } catch (error) {
      console.error('Error loading schedule:', error);
      showNotification(`Failed to load schedule: ${error.message}`, 'error');
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
    setEditingIndex(index);
  };

  const handleEditSave = (emoji, activity) => {
    if (editingIndex !== null && weekSchedule[activeDay]) {
      const newDaySchedule = weekSchedule[activeDay].map((item, index) => 
        index === editingIndex ? { emoji, activity } : item
      );
      
      onDayScheduleUpdate(activeDay, newDaySchedule);  // Pass both the day and the new schedule
      setEditingIndex(null);
    }
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

  const fetchUserSchedules = useCallback(async () => {
    if (!isAuthenticated) {
      setSchedules([]);
      return;
    }

    try {
      const userSchedules = await getSchedules();
      setSchedules(userSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      showNotification('Failed to fetch schedules', 'error');
    }
  }, [isAuthenticated, showNotification]);

  useEffect(() => {
    fetchUserSchedules();
  }, [fetchUserSchedules]);

  useEffect(() => {
    localStorage.setItem('jsusch2r-show-time-labels', JSON.stringify(showTimeLabels));
  }, [showTimeLabels]);

  useEffect(() => {
    setActiveDay(weekStart);
  }, [weekStart]);

  useEffect(() => {
    onActiveDayChange(activeDay);
  }, [activeDay, onActiveDayChange]);

  // Effect to handle auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserSchedules();
    } else {
      setSchedules([]);
      setCurrentScheduleId(null);
    }
  }, [isAuthenticated, fetchUserSchedules]);

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
        <div className="flex space-x-2 mb-4">
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
            Save As New
          </button>
          {currentScheduleId && (
            <button
              onClick={handleUpdateSchedule}
              className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover}`}
            >
              Update Current
            </button>
          )}
        </div>
      )}

      {isAuthenticated && schedules.length > 0 && (
        <div className="mb-4">
          <select
            onChange={(e) => handleLoadSchedule(e.target.value)}
            value={currentScheduleId || ""}
            className={`border rounded p-2 w-full ${theme.input}`}
          >
            <option value="">Select a schedule to load</option>
            {schedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {schedule.name} ({new Date(schedule.created_at).toLocaleDateString()})
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

      {editingIndex !== null && weekSchedule[activeDay] && weekSchedule[activeDay][editingIndex] && (
        <EditPopup
          emoji={weekSchedule[activeDay][editingIndex].emoji}
          activity={weekSchedule[activeDay][editingIndex].activity}
          emojiLibrary={emojiLibrary}
          onSave={handleEditSave}
          onClose={() => setEditingIndex(null)}
        />
      )}
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
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default WeeklySchedule;
