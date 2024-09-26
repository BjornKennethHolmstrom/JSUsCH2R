import React, { useState, useEffect } from 'react';
import JSUsCH2R from './components/JSUsCH2R';
import EmojiLibrary from './components/EmojiLibrary';
import EditPopup from './components/EditPopup';
import ThemeSelector from './components/ThemeSelector';
import TimeAllocationAnalysis from './components/TimeAllocationAnalysis';
import ShareModal from './components/ShareModal';
import WeeklySchedule from './components/WeeklySchedule';
import ScheduleLibrarySharing from './components/ScheduleLibrarySharing';
import Notification from './components/Notification';
import HelpModal from './components/HelpModal';
import { useTheme } from './themes';
import { saveScheduleLibrary, getScheduleLibrary, updateLibraryName } from './services/api';

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
  { emoji: "🍲", activity: "Cooking" },
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
  const [activeDay, setActiveDay] = useState('Mon');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [timeAllocationData, setTimeAllocationData] = useState(null);
  const [currentLibraryId, setCurrentLibraryId] = useState(null);
  const [currentLibraryName, setCurrentLibraryName] = useState('');
  const [notification, setNotification] = useState(null);
  const [showIntro, setShowIntro] = useState(false);
  const [introLibraryName, setIntroLibraryName] = useState('My Schedule Library');
  const [isLoading, setIsLoading] = useState(true);




  useEffect(() => {
    const initializeLibrary = async () => {
      setIsLoading(true);
      const savedLibraryId = localStorage.getItem('currentLibraryId');
      if (savedLibraryId) {
        try {
          await loadLibrary(savedLibraryId);
        } catch (error) {
          console.error('Error loading saved library:', error);
          setShowIntro(true);
        }
      } else {
        setShowIntro(true);
      }
      setIsLoading(false);
    };

    initializeLibrary();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const createNewLibrary = async (name = 'My Schedule Library') => {
    const newLibrary = {
      name,
      schedule: weekSchedule,
      emojiLibrary: emojiLibrary,
    };
    try {
      const { id, name: savedName } = await saveScheduleLibrary(newLibrary);
      setCurrentLibraryId(id);
      setCurrentLibraryName(savedName);
      localStorage.setItem('currentLibraryId', id);
      showNotification('New library created successfully');
    } catch (error) {
      console.error('Error creating new library:', error);
      showNotification(error.message, 'error');
    }
  };

  const loadLibrary = async (id) => {
    try {
      const library = await getScheduleLibrary(id);
      setWeekSchedule(library.schedule);
      setEmojiLibrary(library.emojiLibrary);
      setCurrentLibraryName(library.name);
      setCurrentLibraryId(id);
      showNotification('Library loaded successfully');
    } catch (error) {
      console.error('Error loading library:', error);
      showNotification(error.message, 'error');
      throw error; // Propagate the error
    }
  };

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

  const handleUpdateEmoji = (oldEmoji, newEmoji, newActivity) => {
    setEmojiLibrary(prevLibrary => 
      prevLibrary.map(item => 
        item.emoji === oldEmoji ? { emoji: newEmoji, activity: newActivity } : item
      )
    );
  };

  const handleRemoveEmoji = (emoji) => {
    setEmojiLibrary(emojiLibrary.filter(item => item.emoji !== emoji));
  };

  const handleUpdateLibraryName = async (newName) => {
    try {
      await updateLibraryName(currentLibraryId, newName);
      setCurrentLibraryName(newName);
      showNotification('Library name updated successfully');
    } catch (error) {
      console.error('Error updating library name:', error);
      showNotification(error.message, 'error');
    }
  };

  const handleLoadSharedLibrary = (library) => {
    setWeekSchedule(library.schedule);
    setEmojiLibrary(library.emojiLibrary);
    setCurrentLibraryName(library.name);
    showNotification('Shared library loaded successfully');
  };

  const handleMergeEmojis = (newEmojiLibrary) => {
    setEmojiLibrary(newEmojiLibrary);
    showNotification('Emoji libraries merged successfully');
  };

  const handleCloseIntro = async () => {
    setShowIntro(false);
    await createNewLibrary(introLibraryName);
  };

  const { theme } = useTheme();

  const toggleWeekStart = () => {
    setWeekStart(prev => prev === 'Mon' ? 'Sun' : 'Mon');
  };

  const handleTooltipDismiss = () => {
    setHasSeenTooltip(true);
  };

  const generateTimeAllocationData = (mode = 'week') => {
    const scheduleToAnalyze = mode === 'week' ? Object.values(weekSchedule).flat() : weekSchedule[activeDay];
    const analysis = {};
    scheduleToAnalyze.forEach(item => {
      if (analysis[item.activity]) {
        analysis[item.activity] += 1;
      } else {
        analysis[item.activity] = 1;
      }
    });

    return Object.entries(analysis).map(([activity, hours]) => ({
      name: activity,
      value: hours,
      percentage: (hours / (mode === 'week' ? 168 : 24) * 100).toFixed(1)
    }));
  };

  const handleResetLibrary = () => {
    setWeekSchedule(defaultWeekSchedule);
    setEmojiLibrary(defaultEmojiLibrary);
    setCurrentLibraryId(null);
    setCurrentLibraryName('');
    localStorage.removeItem('currentLibraryId');
    setShowIntro(true);
  };

  const handleOpenShareModal = () => {
    const weeklyData = generateTimeAllocationData('week');
    const dailyData = generateTimeAllocationData('day');
    setTimeAllocationData({ weekly: weeklyData, daily: dailyData });
    setIsShareModalOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a more sophisticated loading indicator
  }

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text} p-2 sm:p-4 flex flex-col`}>
      {showIntro && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
          <div className={`${theme.card} p-6 rounded-lg max-w-lg`}>
            <h2 className={`text-2xl font-bold mb-4 ${theme.text}`}>Welcome to JSUsCH²R</h2>
            <p className={`mb-4 ${theme.text}`}>
              JSUsCH²R is a fun and interactive web application that helps you visualize your weekly schedule using Unicode emojis. You can customize your activities, share your schedule with friends, and explore other users' schedules for inspiration.
            </p>
            <input
              type="text"
              value={introLibraryName}
              onChange={(e) => setIntroLibraryName(e.target.value)}
              placeholder="Enter your library name"
              className={`${theme.input} px-2 py-1 rounded w-full mb-4`}
            />
            <button
              onClick={handleCloseIntro}
              className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover}`}
            >
              Get Started
            </button>
          </div>
        </div>
      )}
      <div className="flex-grow max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <ThemeSelector />
          <div className="flex items-center">
            <input
              type="text"
              value={currentLibraryName}
              onChange={(e) => setCurrentLibraryName(e.target.value)}
              onBlur={() => handleUpdateLibraryName(currentLibraryName)}
              className={`${theme.input} px-2 py-1 rounded mr-2`}
            />
            <button
              onClick={() => handleUpdateLibraryName(currentLibraryName)}
              className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover}`}
            >
              Update Name
            </button>
          </div>
        </div>
        <WeeklySchedule
          weekSchedule={weekSchedule}
          onDayScheduleUpdate={handleDayScheduleUpdate}
          onEmojiClick={handleEmojiClick}
          weekStart={weekStart}
          showTooltip={!hasSeenTooltip}
          onTooltipDismiss={handleTooltipDismiss}
          onOpenHelpModal={() => setIsHelpModalOpen(true)}
          onActiveDayChange={setActiveDay}
          activeDay={activeDay}
        />
        <TimeAllocationAnalysis 
          weekSchedule={weekSchedule}
          activeDay={activeDay}
          onShare={(imageDataUrl, mode, data) => {
            setTimeAllocationData({ imageDataUrl, mode, data });
            setIsShareModalOpen(true);
          }}
        />
        <EmojiLibrary
          emojiLibrary={emojiLibrary}
          onAddEmoji={handleAddEmoji}
          onRemoveEmoji={handleRemoveEmoji}
          onUpdateEmoji={handleUpdateEmoji}
          onRestoreDefaults={() => setEmojiLibrary(defaultEmojiLibrary)}
        />
        <ScheduleLibrarySharing
          currentLibraryId={currentLibraryId}
          currentLibraryName={currentLibraryName}
          onLoadSharedLibrary={handleLoadSharedLibrary}
          onMergeEmojis={handleMergeEmojis}
          showNotification={showNotification}
          onResetLibrary={handleResetLibrary}
        />
        <button
          onClick={handleOpenShareModal}
          className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover} mt-4`}
        >
          Share My Schedule as Image
        </button>
        {isShareModalOpen && (
          <ShareModal
            weekSchedule={weekSchedule}
            activeDay={activeDay}
            timeAllocationData={timeAllocationData}
            onClose={() => setIsShareModalOpen(false)}
          />
        )}
        {editingDay !== null && editingIndex !== null && (
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
            activeDay={activeDay}
            timeAllocationData={timeAllocationData}
            onClose={() => setIsShareModalOpen(false)}
          />
        )}
        {isHelpModalOpen && (
          <HelpModal onClose={() => setIsHelpModalOpen(false)} />
        )}
      </div>
      <div className="text-center mt-4">
        <a 
          href="https://bjornkennethholmstrom.wordpress.com/jsusch2r/" 
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
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default App;
