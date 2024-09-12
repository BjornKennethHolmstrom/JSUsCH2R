import React, { useState } from 'react';
import { useTheme } from '../themes';

const EditPopup = ({ emoji, activity, emojiLibrary, onSave, onClose }) => {
  const [currentEmoji, setCurrentEmoji] = useState(emoji);
  const [currentActivity, setCurrentActivity] = useState(activity);
  const { theme } = useTheme();

  const handleSave = () => {
    onSave(currentEmoji, currentActivity);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className={`${theme.card} rounded-lg p-6 max-w-md w-full`}>
        <h2 className={`text-2xl font-semibold mb-4 ${theme.text}`}>Edit Schedule Item</h2>
        <div className="mb-4">
          <label className={`block mb-2 ${theme.text}`}>Emoji:</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {emojiLibrary.map((item, index) => (
              <button
                key={index}
                className={`text-2xl p-2 rounded ${item.emoji === currentEmoji ? theme.accent : 'bg-gray-200'} ${theme.hover}`}
                onClick={() => {
                  setCurrentEmoji(item.emoji);
                  setCurrentActivity(item.activity);
                }}
                title={item.activity}
              >
                {item.emoji}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={currentEmoji}
            onChange={(e) => setCurrentEmoji(e.target.value)}
            className={`border rounded p-2 text-center w-full ${theme.text}`}
            maxLength={2}
          />
        </div>
        <div className="mb-4">
          <label className={`block mb-2 ${theme.text}`}>Activity:</label>
          <input
            type="text"
            value={currentActivity}
            onChange={(e) => setCurrentActivity(e.target.value)}
            className={`border rounded p-2 w-full ${theme.text}`}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className={`bg-gray-300 text-black px-4 py-2 rounded ${theme.hover}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover}`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPopup;
