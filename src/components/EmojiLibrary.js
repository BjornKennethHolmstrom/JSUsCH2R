import React, { useState } from 'react';
import { useTheme } from '../themes';
import EmojiLibraryHelpModal from './EmojiLibraryHelpModal';
import ConfirmDialog from './ConfirmDialog';

const EmojiLibrary = ({ emojiLibrary, onAddEmoji, onRemoveEmoji, onRestoreDefaults, onOpenHelpModal }) => {
  const [newEmoji, setNewEmoji] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { theme } = useTheme();

  const handleAddEmoji = () => {
    if (newEmoji && newActivity && !emojiLibrary.some(item => item.emoji === newEmoji)) {
      onAddEmoji(newEmoji, newActivity);
      setNewEmoji('');
      setNewActivity('');
    }
  };

  const handleRestoreDefaultsClick = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmRestore = () => {
    onRestoreDefaults();
    setIsConfirmDialogOpen(false);
  };

  return (
    <div className={`${theme.card} rounded-lg shadow-lg p-4 mt-8 max-w-2xl mx-auto`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-semibold ${theme.text}`}>Emoji Library</h2>
        <button
          onClick={() => setIsHelpModalOpen(true)}
          className={`${theme.accent} ${theme.text} px-2 py-1 rounded ${theme.hover} text-sm`}
        >
          ?
        </button>
      </div>
      <h2 className={`text-2xl font-semibold mb-4 ${theme.text}`}>Emoji Library</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {emojiLibrary.map((item, index) => (
          <button
            key={index}
            className={`text-2xl p-2 ${theme.emojiBg} rounded ${theme.hover}`}
            onClick={() => onRemoveEmoji(item.emoji)}
            title={`${item.activity} (Click to remove)`}
          >
            {item.emoji}
          </button>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <input
          type="text"
          value={newEmoji}
          onChange={(e) => setNewEmoji(e.target.value)}
          className={`border rounded p-2 text-center w-full sm:w-24 ${theme.input}`}
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
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleAddEmoji}
          className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover} w-full sm:w-auto`}
        >
          Add Emoji
        </button>
        <button
          onClick={handleRestoreDefaultsClick}
          className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover} w-full sm:w-auto`}
        >
          Restore Defaults
        </button>
      </div>
      {isHelpModalOpen && (
        <EmojiLibraryHelpModal onClose={() => setIsHelpModalOpen(false)} />
      )}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmRestore}
        message="Are you sure you want to restore default emojis? This will remove all custom emojis."
      />
    </div>
  );
};

export default EmojiLibrary;
