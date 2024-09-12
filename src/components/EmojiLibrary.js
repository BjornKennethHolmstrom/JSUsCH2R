import React, { useState } from 'react';
import { useTheme } from '../themes';

const EmojiLibrary = ({ emojiLibrary, onAddEmoji, onRemoveEmoji, onRestoreDefaults }) => {
  const [newEmoji, setNewEmoji] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const { theme } = useTheme();

  const handleAddEmoji = () => {
    if (newEmoji && newActivity && !emojiLibrary.some(item => item.emoji === newEmoji)) {
      onAddEmoji(newEmoji, newActivity);
      setNewEmoji('');
      setNewActivity('');
    }
  };

  return (
    <div className={`mt-8 ${theme.card} rounded-lg shadow-lg p-6 max-w-2xl mx-auto`}>
      <h2 className={`text-2xl font-semibold mb-4 ${theme.text}`}>Emoji Library</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {emojiLibrary.map((item, index) => (
          <button
            key={index}
            className={`text-2xl p-2 rounded ${theme.hover}`}
            onClick={() => onRemoveEmoji(item.emoji)}
            title={`${item.activity} (Click to remove)`}
          >
            {item.emoji}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={newEmoji}
          onChange={(e) => setNewEmoji(e.target.value)}
          className={`border rounded p-2 text-center ${theme.input}`}
          maxLength={2}
          placeholder="New emoji"
        />
        <input
          type="text"
          value={newActivity}
          onChange={(e) => setNewActivity(e.target.value)}
          className={`border rounded p-2 flex-grow ${theme.input}`}
          placeholder="Activity description"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleAddEmoji}
          className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover}`}
        >
          Add Emoji
        </button>
        <button
          onClick={onRestoreDefaults}
          className={`bg-gray-500 text-white px-4 py-2 rounded ${theme.hover}`}
        >
          Restore Defaults
        </button>
      </div>
    </div>
  );
};

export default EmojiLibrary;
