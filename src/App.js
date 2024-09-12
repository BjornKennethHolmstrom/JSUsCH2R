import React, { useState } from 'react';
import JSUsCH2R from './components/JSUsCH2R';
import EmojiLibrary from './components/EmojiLibrary';
import EditPopup from './components/EditPopup';
import ThemeSelector from './components/ThemeSelector';
import TimeAllocationAnalysis from './components/TimeAllocationAnalysis';
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

const defaultSchedule = [
  { emoji: "😴", activity: "Sleeping" },
  { emoji: "😴", activity: "Sleeping" },
  { emoji: "😴", activity: "Sleeping" },
  { emoji: "😴", activity: "Sleeping" },
  { emoji: "😴", activity: "Sleeping" },
  { emoji: "😴", activity: "Sleeping" },
  { emoji: "🧘", activity: "Meditating" },
  { emoji: "🍵", activity: "Having tea" },
  { emoji: "🎨", activity: "Creating art" },
  { emoji: "👔", activity: "Working" },
  { emoji: "🎮", activity: "Playing games" },
  { emoji: "🎶", activity: "Listening to music" },
  { emoji: "🍲", activity: "Eating lunch" },
  { emoji: "📷", activity: "Taking photos" },
  { emoji: "👔", activity: "Working" },
  { emoji: "💻", activity: "Coding" },
  { emoji: "📝", activity: "Writing" },
  { emoji: "🥗", activity: "Having dinner" },
  { emoji: "🚶", activity: "Walking" },
  { emoji: "💪", activity: "Exercising" },
  { emoji: "🤗", activity: "Socializing" },
  { emoji: "📖", activity: "Reading" },
  { emoji: "😴", activity: "Sleeping" },
  { emoji: "😴", activity: "Sleeping" }
];

const defaultEmojiLibrary = [
  { emoji: "😴", activity: "Sleeping" },
  { emoji: "🧘", activity: "Meditating" },
  { emoji: "🍵", activity: "Having tea" },
  { emoji: "🎨", activity: "Creating art" },
  { emoji: "👔", activity: "Working" },
  { emoji: "🎮", activity: "Playing games" },
  { emoji: "🎶", activity: "Listening to music" },
  { emoji: "🍲", activity: "Eating lunch" },
  { emoji: "📷", activity: "Taking photos" },
  { emoji: "💻", activity: "Coding" },
  { emoji: "📝", activity: "Writing" },
  { emoji: "🥗", activity: "Having dinner" },
  { emoji: "🚶", activity: "Walking" },
  { emoji: "💪", activity: "Exercising" },
  { emoji: "🤗", activity: "Socializing" },
  { emoji: "📖", activity: "Reading" }
];

const App = () => {
  const [schedule, setSchedule] = useLocalStorage('jsusch2r-schedule', defaultSchedule);
  const [emojiLibrary, setEmojiLibrary] = useLocalStorage('jsusch2r-emoji-library', defaultEmojiLibrary);
  const [editingIndex, setEditingIndex] = useState(null);
  const { theme } = useTheme();


  const handleScheduleUpdate = (newSchedule) => {
    setSchedule(newSchedule);
  };

  const handleEmojiClick = (index) => {
    setEditingIndex(index);
  };

  const handleEditSave = (emoji, activity) => {
    const newSchedule = [...schedule];
    newSchedule[editingIndex] = { emoji, activity };
    handleScheduleUpdate(newSchedule);
    setEditingIndex(null);
  };

  const handleAddEmoji = (emoji, activity) => {
    if (!emojiLibrary.some(item => item.emoji === emoji)) {
      setEmojiLibrary([...emojiLibrary, { emoji, activity }]);
    }
  };

  const handleRemoveEmoji = (emoji) => {
    setEmojiLibrary(emojiLibrary.filter(item => item.emoji !== emoji));
  };

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text} p-2 sm:p-4 flex flex-col`}>
      <div className="flex-grow max-w-4xl mx-auto w-full">
        <ThemeSelector />
        <JSUsCH2R schedule={schedule} onEmojiClick={handleEmojiClick} />
        <TimeAllocationAnalysis schedule={schedule} />
        <EmojiLibrary
          emojiLibrary={emojiLibrary}
          onAddEmoji={handleAddEmoji}
          onRemoveEmoji={handleRemoveEmoji}
          onRestoreDefaults={() => setEmojiLibrary(defaultEmojiLibrary)}
        />
        {editingIndex !== null && (
          <EditPopup
            emoji={schedule[editingIndex].emoji}
            activity={schedule[editingIndex].activity}
            emojiLibrary={emojiLibrary}
            onSave={handleEditSave}
            onClose={() => setEditingIndex(null)}
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
