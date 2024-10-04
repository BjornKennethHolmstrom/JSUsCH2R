import React, { useState, useEffect } from 'react';
import { useTheme } from '../themes';
import { 
  getPublicSchedules, 
  getPublicEmojiLibraries, 
  getSharedSchedule, 
  mergeEmojiLibraries, 
  deleteScheduleLibrary,
  getPublicSchedule, 
  getPublicEmojiLibrary, 
  saveSchedule, 
  saveEmojiLibrary 
} from '../services/api';
import ConfirmDialog from './ConfirmDialog';
import HelpModal from './HelpModalSharing';

const ScheduleLibrarySharing = ({
  currentLibraryId,
  currentLibraryName,
  onLoadSharedLibrary,
  onMergeEmojis,
  showNotification,
  onResetLibrary,
  weekSchedule,
  emojiLibrary,
  isAuthenticated,
  visibility,
  setVisibility,
  sharedWith,
  setSharedWith
}) => {
  const [sharedLink, setSharedLink] = useState('');
  const [publicSchedules, setPublicSchedules] = useState([]);
  const [publicEmojiLibraries, setPublicEmojiLibraries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const { theme } = useTheme();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      fetchPublicSchedules();
      fetchPublicEmojiLibraries();
    }
  }, [searchTerm]);

  const fetchPublicSchedules = async () => {
    try {
      const schedules = await getPublicSchedules(searchTerm);
      setPublicSchedules(schedules);
    } catch (error) {
      console.error('Error fetching public schedules:', error);
    }
  };

  const fetchPublicEmojiLibraries = async () => {
    try {
      const libraries = await getPublicEmojiLibraries(searchTerm);
      setPublicEmojiLibraries(libraries);
    } catch (error) {
      console.error('Error fetching public emoji libraries:', error);
    }
  };

  const handleShareCurrentLibrary = () => {
    if (!isAuthenticated) {
      showNotification('Please log in to share your library', 'error');
      return;
    }
    if (!currentLibraryId) {
      showNotification('Please save your library first', 'error');
      return;
    }
    const shareableLink = `${window.location.origin}/share/${currentLibraryId}`;
    navigator.clipboard.writeText(shareableLink)
      .then(() => showNotification('Shareable link copied to clipboard!', 'success'))
      .catch(() => showNotification('Failed to copy link. Your shareable link is: ' + shareableLink, 'error'));
  };

  const handleLoadPublicSchedule = async (uniqueId) => {
    try {
      const publicSchedule = await getPublicSchedule(uniqueId);
      onLoadSharedLibrary({ schedule: publicSchedule });
      showNotification('Public schedule loaded successfully');
    } catch (error) {
      console.error('Error loading public schedule:', error);
      showNotification('Failed to load public schedule', 'error');
    }
  };

  const handleSaveSchedule = async () => {
    if (!isAuthenticated) {
      showNotification('Please log in to save your schedule', 'error');
      return;
    }
    try {
      await saveSchedule(currentLibraryId, currentLibraryName, weekSchedule, visibility, sharedWith);
      showNotification('Schedule saved successfully');
    } catch (error) {
      console.error('Error saving schedule:', error);
      showNotification('Failed to save schedule', 'error');
    }
  };

  const handleSaveEmojiLibrary = async () => {
    if (!isAuthenticated) {
      showNotification('Please log in to save your emoji library', 'error');
      return;
    }
    try {
      await saveEmojiLibrary(currentLibraryName, emojiLibrary, visibility, sharedWith);
      showNotification('Emoji library saved successfully');
    } catch (error) {
      console.error('Error saving emoji library:', error);
      showNotification('Failed to save emoji library', 'error');
    }
  };

  const handleViewPublicLibrary = async (uniqueId) => {
    try {
      const publicLibrary = await getPublicEmojiLibrary(uniqueId);
      onMergeEmojis(publicLibrary.emojis);
      showNotification('Public emoji library loaded successfully');
    } catch (error) {
      console.error('Error loading public emoji library:', error);
      showNotification('Failed to load public emoji library', 'error');
    }
  };

  const handleLoadSharedLibrary = async () => {
    try {
      const uniqueId = sharedLink.split('/').pop();
      const shared = await getSharedSchedule(uniqueId);
      onLoadSharedLibrary(shared);
      alert('Shared schedule loaded successfully!');
    } catch (error) {
      console.error('Error loading shared schedule:', error);
      alert('Failed to load shared schedule. Please check the link and try again.');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMergeEmojis = async (uniqueId) => {
    try {
      await mergeEmojiLibraries(uniqueId, currentLibraryId);
      showNotification('Emoji libraries merged successfully!');
    } catch (error) {
      console.error('Error merging emoji libraries:', error);
      showNotification('Failed to merge emoji libraries. Please try again.', 'error');
    }
  };

  const handleResetLibrary = async () => {
    try {
      await deleteScheduleLibrary(currentLibraryId);
      onResetLibrary();
      showNotification('Library reset successfully');
    } catch (error) {
      console.error('Error resetting library:', error);
      showNotification(error.message, 'error');
    }
  };


  return (
    <div className={`${theme.card} rounded-lg shadow-lg p-4 mt-8 max-w-2xl mx-auto`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-semibold ${theme.text}`}>Share and Explore</h2>
        <div className="flex items-center">
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className={`${theme.accent} ${theme.text} px-2 py-1 rounded ${theme.hover} text-sm`}
          >
            ?
          </button>
        </div>
      </div>

      {/* Public browsing section */}
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${theme.text} mb-2`}>Browse Public Libraries and Schedules</h3>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search public libraries and schedules"
          className={`border rounded p-2 w-full ${theme.input}`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className={`${theme.text} font-semibold mb-2`}>Public Schedules</h3>
          {publicSchedules.map((schedule) => (
            <div key={schedule.unique_id} className={`${theme.card} p-2 rounded mb-2`}>
              <h4 className={`${theme.text} font-semibold`}>{schedule.name}</h4>
              <p className={`${theme.text} text-sm`}>By: {schedule.user_email}</p>
              <button
                onClick={() => handleLoadPublicSchedule(schedule.unique_id)}
                className={`${theme.accent} ${theme.text} px-2 py-1 rounded ${theme.hover} mt-2 text-sm`}
              >
                View Schedule
              </button>
            </div>
          ))}
        </div>
        <div>
          <h3 className={`${theme.text} font-semibold mb-2`}>Public Emoji Libraries</h3>
          {publicEmojiLibraries.map((library) => (
            <div key={library.unique_id} className={`${theme.card} p-2 rounded mb-2`}>
              <h4 className={`${theme.text} font-semibold`}>{library.name}</h4>
              <button
                onClick={() => handleViewPublicLibrary(library.unique_id)}
                className={`${theme.accent} ${theme.text} px-2 py-1 rounded ${theme.hover} mt-2 text-sm`}
              >
                View Library
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Authentication-required section */}
      {isAuthenticated && (
      <>
        <div className="mt-8 mb-4">
          <h3 className={`text-lg font-semibold ${theme.text} mb-2`}>Share</h3>
          <button
            onClick={handleShareCurrentLibrary}
            className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover}`}
          >
            Share Schedule-Library
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={sharedLink}
              onChange={(e) => setSharedLink(e.target.value)}
              placeholder="Enter shared Schedule-Library link"
              className={`border rounded p-2 flex-grow ${theme.input}`}
            />
            <button
              onClick={handleLoadSharedLibrary}
              className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover} whitespace-nowrap`}
            >
              Load Shared Schedule-Library
            </button>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600`}
          >
            Reset Library
          </button>
        </div>
      </>
    )}

      {isHelpModalOpen && (
        <HelpModal onClose={() => setIsHelpModalOpen(false)} />
      )}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetLibrary}
        message="Are you sure you want to reset your library? This action cannot be undone."
      />
    </div>
  );
};

export default ScheduleLibrarySharing;
