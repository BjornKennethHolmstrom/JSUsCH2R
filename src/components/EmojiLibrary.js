import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../themes';
import EmojiLibraryHelpModal from './EmojiLibraryHelpModal';
import ConfirmDialog from './ConfirmDialog';
import { Trash2 } from 'lucide-react';

const EmojiLibrary = ({ emojiLibrary, onAddEmoji, onRemoveEmoji, onUpdateEmoji, onRestoreDefaults }) => {
  const [newEmoji, setNewEmoji] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const { theme } = useTheme();
  const libraryRef = useRef(null);

  const handleDeselect = () => {
    setSelectedEmoji(null);
    setNewEmoji('');
    setNewActivity('');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (libraryRef.current && !libraryRef.current.contains(event.target)) {
        handleDeselect();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleContainerClick = (event) => {
    if (event.target === libraryRef.current) {
      handleDeselect();
    }
  };

  const handleAddEmoji = () => {
    if (newEmoji && newActivity && !emojiLibrary.some(item => item.emoji === newEmoji)) {
      onAddEmoji(newEmoji, newActivity);
      handleDeselect();
    }
  };

  const handleEmojiClick = (emoji, activity) => {
    if (selectedEmoji === emoji) {
      handleDeselect();
    } else {
      setSelectedEmoji(emoji);
      setNewEmoji(emoji);
      setNewActivity(activity);
    }
  };

  const handleUpdateEmoji = () => {
    if (selectedEmoji && newEmoji && newActivity) {
      onUpdateEmoji(selectedEmoji, newEmoji, newActivity);
      handleDeselect();
    }
  };

  const handleRemoveEmoji = () => {
    if (selectedEmoji) {
      onRemoveEmoji(selectedEmoji);
      handleDeselect();
    }
  };

  const handleRestoreDefaultsClick = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmRestore = () => {
    onRestoreDefaults();
    setIsConfirmDialogOpen(false);
    handleDeselect();
  };

  return (
    <div 
      ref={libraryRef} 
      className={`${theme.card} rounded-lg shadow-lg p-4 mt-8 max-w-2xl mx-auto`}
      onClick={handleContainerClick}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-semibold ${theme.text}`}>Emoji Library</h2>
        <button
          onClick={() => setIsHelpModalOpen(true)}
          className={`${theme.accent} ${theme.text} px-2 py-1 rounded ${theme.hover} text-sm`}
        >
          ?
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {emojiLibrary.map((item) => (
          <button
            key={item.emoji}
            className={`text-2xl p-2 ${theme.emojiBg} rounded ${theme.hover} ${selectedEmoji === item.emoji ? 'ring-2 ring-blue-500' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleEmojiClick(item.emoji, item.activity); }}
            title={item.activity}
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
          placeholder="Emoji"
          onClick={(e) => e.stopPropagation()}
        />
        <input
          type="text"
          value={newActivity}
          onChange={(e) => setNewActivity(e.target.value)}
          className={`border rounded p-2 flex-grow ${theme.input}`}
          placeholder="Activity description"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); selectedEmoji ? handleUpdateEmoji() : handleAddEmoji(); }}
          className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover} w-full sm:w-auto`}
        >
          {selectedEmoji ? 'Update Emoji' : 'Add Emoji'}
        </button>
        {selectedEmoji && (
          <button
            onClick={(e) => { e.stopPropagation(); handleRemoveEmoji(); }}
            className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto flex items-center justify-center`}
          >
            <Trash2 className="mr-2" size={20} />
            Remove Emoji
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); handleRestoreDefaultsClick(); }}
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
