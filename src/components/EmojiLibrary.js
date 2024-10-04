import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../themes';
import { saveEmojiLibrary, getUserEmojiLibraries } from '../services/api';
import { createEmojiLibrary, updateEmojiLibrary, deleteEmojiLibrary } from '../services/api';
import EmojiLibraryHelpModal from './EmojiLibraryHelpModal';
import ConfirmDialog from './ConfirmDialog';
import { Trash2, Share2, Lock, Users } from 'lucide-react';

const EmojiLibrary = ({ 
  emojiLibrary, 
  onAddEmoji, 
  onRemoveEmoji, 
  onUpdateEmoji, 
  onRestoreDefaults, 
  isAuthenticated, 
  userId, 
  showNotification,
  visibility,
  setVisibility,
  sharedWith,
  setSharedWith
}) => {
  const [newEmoji, setNewEmoji] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const { theme } = useTheme();
  const libraryRef = useRef(null);
  const [libraryName, setLibraryName] = useState('My Emoji Library');
  const [libraries, setLibraries] = useState([]);
  const [userLibraries, setUserLibraries] = useState([]);

  const handleDeselect = () => {
    setSelectedEmoji(null);
    setNewEmoji('');
    setNewActivity('');
  };

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchUserLibraries();
    }
  }, [isAuthenticated, userId]);

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

  const fetchUserLibraries = async () => {
    try {
      const libraries = await getUserEmojiLibraries(userId);
      setUserLibraries(libraries);
    } catch (error) {
      console.error('Error fetching user libraries:', error);
      showNotification('Failed to fetch user libraries', 'error');
    }
  };

  const handleSaveLibrary = async () => {
    try {
      await saveEmojiLibrary(libraryName, emojiLibrary, visibility, sharedWith);
      fetchUserLibraries();
      showNotification('Emoji library saved successfully');
    } catch (error) {
      console.error('Error saving emoji library:', error);
      showNotification('Failed to save emoji library', 'error');
    }
  };

  const handleDeleteLibrary = async () => {
    try {
      await deleteEmojiLibrary(emojiLibrary.id);
      fetchUserLibraries();
      onRestoreDefaults(); // Reset to default library after deletion
    } catch (error) {
      console.error('Error deleting library:', error);
    }
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
    <div 
      ref={libraryRef} 
      className={`${theme.card} rounded-lg shadow-lg p-4 mt-8 max-w-2xl mx-auto`}
      onClick={handleContainerClick}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-semibold ${theme.text}`}>Emoji Library</h2>
        <div className="flex items-center">
          {isAuthenticated && (
            <button
              onClick={handleToggleVisibility}
              className={`${theme.accent} ${theme.text} p-2 rounded ${theme.hover} mr-2`}
              title={`Visibility: ${visibility}`}
            >
              {renderVisibilityIcon()}
            </button>
          )}
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className={`${theme.accent} ${theme.text} px-2 py-1 rounded ${theme.hover} text-sm`}
          >
            ?
          </button>
        </div>
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
          <input
            type="text"
            value={libraryName}
            onChange={(e) => setLibraryName(e.target.value)}
            className={`border rounded p-2 w-full ${theme.input}`}
            placeholder="Library Name"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSaveLibrary}
              className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover}`}
            >
              Save Library
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleRestoreDefaultsClick(); }}
              className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover}`}
            >
              Restore Defaults
            </button>
          </div>
        </div>
      )}

      {isAuthenticated && userLibraries.length > 0 && (
        <div className="mt-4 mb-4">
          <h3 className={`text-lg font-semibold ${theme.text} mb-2`}>Your Libraries</h3>
          <ul className="space-y-2">
            {userLibraries.map((lib) => (
              <li key={lib.id} className="flex justify-between items-center">
                <span className={theme.text}>{lib.name}</span>
                <button
                  onClick={() => onUpdateEmoji(JSON.parse(lib.emojis))}
                  className={`${theme.accent} ${theme.text} px-2 py-1 rounded ${theme.hover} text-sm`}
                >
                  Load
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

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
        <button
          onClick={(e) => { e.stopPropagation(); selectedEmoji ? handleUpdateEmoji() : handleAddEmoji(); }}
          className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover} w-full sm:w-auto`}
        >
          {selectedEmoji ? 'Update Emoji' : 'Add Emoji'}
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">

        {selectedEmoji && (
          <button
            onClick={(e) => { e.stopPropagation(); handleRemoveEmoji(); }}
            className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto flex items-center justify-center`}
          >
            <Trash2 className="mr-2" size={20} />
            Remove Emoji
          </button>
        )}
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
