import React, { useState, useEffect } from 'react';
import JSUsCH2R from './components/JSUsCH2R';
import EmojiLibrary from './components/EmojiLibrary';
import EditPopup from './components/EditPopup';
import ThemeSelector from './components/ThemeSelector';
import TimeAllocationAnalysis from './components/TimeAllocationAnalysis';
import ShareModal from './components/ShareModal';
import WeeklySchedule from './components/WeeklySchedule';
import { useTheme } from './themes';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

const defaultDaySchedule = [
  { emoji: "😴", activity: "Sleeping" },
  { emoji: "😴", activity: "Sleeping" },
  { emoji: "😴", activity: "Sleeping" },
  { emoji: "😴", activity: "Sleeping" },
  { emoji: "😴", activity: "Sleeping" },
  { emoji: "😴", activity: "Sleeping" },
  { emoji: "🧘", activity: "Meditating" },
  { emoji: "🍳", activity: "Breakfast" },
  { emoji: "🚿", activity: "Getting ready" },
  { emoji: "💼", activity: "Work" },
  { emoji: "💼", activity: "Work" },
  { emoji: "💼", activity: "Work" },
  { emoji: "🥗", activity: "Lunch" },
  { emoji: "💼", activity: "Work" },
  { emoji: "💼", activity: "Work" },
  { emoji: "🏋️", activity: "Exercise" },
  { emoji: "🍲", activity: "Dinner" },
  { emoji: "📚", activity: "Reading" },
  { emoji: "🎨", activity: "Hobby time" },
  { emoji: "📺", activity: "Relaxing" },
  { emoji: "🛁", activity: "Self-care" },
  { emoji: "📱", activity: "Social media" },
  { emoji: "😴", activity: "Sleeping" },
  { emoji: "😴", activity: "Sleeping" }
];

const defaultWeekSchedule = {
  Mon: defaultDaySchedule,
  Tue: defaultDaySchedule,
  Wed: defaultDaySchedule,
  Thu: defaultDaySchedule,
  Fri: defaultDaySchedule,
  Sat: defaultDaySchedule,
  Sun: defaultDaySchedule,
};

const defaultEmojiLibrary = [
  { emoji: "😴", activity: "Sleeping" },
  { emoji: "🧘", activity: "Meditating" },
  { emoji: "🍳", activity: "Cooking" },
  { emoji: "💼", activity: "Working" },
  { emoji: "🏋️", activity: "Exercising" },
  { emoji: "📚", activity: "Reading" },
  { emoji: "🎨", activity: "Creating" },
  { emoji: "🎮", activity: "Gaming" },
  { emoji: "🌳", activity: "Nature walk" },
  { emoji: "💻", activity: "Coding" },
  { emoji: "🎵", activity: "Music" },
  { emoji: "✍️", activity: "Writing" },
  { emoji: "🧹", activity: "Cleaning" },
  { emoji: "👥", activity: "Socializing" },
  { emoji: "🚗", activity: "Commuting" },
  { emoji: "📺", activity: "Watching TV" }
];

const decodeString = (str) => {
  return decodeURIComponent(str.split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
};

const App = () => {
  const [weekSchedule, setWeekSchedule] = useLocalStorage('jsusch2r-week-schedule', defaultWeekSchedule);
  const [emojiLibrary, setEmojiLibrary] = useLocalStorage('jsusch2r-emoji-library', defaultEmojiLibrary);
  const [editingDay, setEditingDay] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [weekStart, setWeekStart] = useLocalStorage('jsusch2r-week-start', 'Mon');
  const [hasSeenTooltip, setHasSeenTooltip] = useLocalStorage('jsusch2r-has-seen-tooltip', false);

  const handleDayScheduleUpdate = (day, newDaySchedule) => {
    setWeekSchedule(prevWeekSchedule => ({
      ...prevWeekSchedule,
      [day]: newDaySchedule
    }));
  };

  const handleEmojiClick = (day, index) => {
    setEditingDay(day);
    setEditingIndex(index);
  };

  const handleEditSave = (emoji, activity) => {
    if (editingDay && editingIndex !== null) {
      const newDaySchedule = [...weekSchedule[editingDay]];
      newDaySchedule[editingIndex] = { emoji, activity };
      handleDayScheduleUpdate(editingDay, newDaySchedule);
      setEditingDay(null);
      setEditingIndex(null);
    }
  };

  const handleAddEmoji = (emoji, activity) => {
    if (!emojiLibrary.some(item => item.emoji === emoji)) {
      setEmojiLibrary([...emojiLibrary, { emoji, activity }]);
    }
  };

  const handleRemoveEmoji = (emoji) => {
    setEmojiLibrary(emojiLibrary.filter(item => item.emoji !== emoji));
  };

  const { theme } = useTheme();

  const toggleWeekStart = () => {
    setWeekStart(prev => prev === 'Mon' ? 'Sun' : 'Mon');
  };

  const handleTooltipDismiss = () => {
    setHasSeenTooltip(true);
  };

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text} p-2 sm:p-4 flex flex-col`}>
      <div className="flex-grow max-w-4xl mx-auto w-full">
        <ThemeSelector />
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={toggleWeekStart}
            className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover}`}
          >
            Week starts on: {weekStart}
          </button>
        </div>
        <WeeklySchedule
          weekSchedule={weekSchedule}
          onDayScheduleUpdate={handleDayScheduleUpdate}
          onEmojiClick={handleEmojiClick}
          weekStart={weekStart}
          showTooltip={!hasSeenTooltip}
          onTooltipDismiss={handleTooltipDismiss}
        />
        <TimeAllocationAnalysis schedule={Object.values(weekSchedule).flat()} />
        <EmojiLibrary
          emojiLibrary={emojiLibrary}
          onAddEmoji={handleAddEmoji}
          onRemoveEmoji={handleRemoveEmoji}
          onRestoreDefaults={() => setEmojiLibrary(defaultEmojiLibrary)}
        />
        <button
          onClick={() => setIsShareModalOpen(true)}
          className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover} mt-4`}
        >
          Share My Schedule
        </button>
        {editingDay && editingIndex !== null && (
          <EditPopup
            emoji={weekSchedule[editingDay][editingIndex].emoji}
            activity={weekSchedule[editingDay][editingIndex].activity}
            emojiLibrary={emojiLibrary}
            onSave={handleEditSave}
            onClose={() => {
              setEditingDay(null);
              setEditingIndex(null);
            }}
          />
        )}
        {isShareModalOpen && (
          <ShareModal
            weekSchedule={weekSchedule}
            onClose={() => setIsShareModalOpen(false)}
          />
        )}
      </div>
      <div className="text-center mt-4">
        <a 
          href="https://github.com/bjornkj/JSUsCH2R" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`text-sm ${theme.text} hover:underline block`}
        >
          JSUsCH²R Project Homepage
        </a>
        <a 
          href="https://www.paypal.com/donate/?hosted_button_id=FX7FQMDQBAR4N" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`text-sm ${theme.text} hover:underline block`}
        >
          Donate to support
        </a>
      </div>
    </div>
  );
};

export default App;
