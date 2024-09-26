import React, { useState, useEffect } from 'react';
import { useTheme } from '../themes';
import { searchPublicLibraries, getScheduleLibrary, mergeEmojiLibraries, deleteScheduleLibrary } from '../services/api';
import ConfirmDialog from './ConfirmDialog';

const ScheduleLibrarySharing = ({ currentLibraryId, currentLibraryName, onLoadSharedLibrary, onMergeEmojis, showNotification, onResetLibrary }) => {

  const [sharedLink, setSharedLink] = useState('');
  const [publicLibraries, setPublicLibraries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (searchTerm) {
      fetchPublicLibraries();
    }
  }, [searchTerm]);

  const fetchPublicLibraries = async () => {
    try {
      const libraries = await searchPublicLibraries(searchTerm);
      setPublicLibraries(libraries);
    } catch (error) {
      console.error('Error fetching public libraries:', error);
    }
  };

  const handleShareCurrentLibrary = () => {
    const shareableLink = `${window.location.origin}/share/${currentLibraryId}`;
    navigator.clipboard.writeText(shareableLink)
      .then(() => alert('Shareable link copied to clipboard!'))
      .catch(() => alert('Failed to copy link. Your shareable link is: ' + shareableLink));
  };

  const handleLoadSharedLibrary = async () => {
    try {
      const libraryId = sharedLink.split('/').pop();
      const library = await getScheduleLibrary(libraryId);
      onLoadSharedLibrary(library);
      alert('Shared library loaded successfully!');
    } catch (error) {
      console.error('Error loading shared library:', error);
      alert('Failed to load shared library. Please check the link and try again.');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMergeLibrary = async (libraryId) => {
    try {
      await mergeEmojiLibraries(libraryId, currentLibraryId);
      const updatedLibrary = await getScheduleLibrary(currentLibraryId);
      onMergeEmojis(updatedLibrary.emojiLibrary);
      alert('Emoji libraries merged successfully!');
    } catch (error) {
      console.error('Error merging emoji libraries:', error);
      alert('Failed to merge emoji libraries. Please try again.');
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
      <h2 className={`text-2xl font-semibold ${theme.text} mb-4`}>Share and Explore</h2>
      
      <div className="mb-4">
        <button
          onClick={handleShareCurrentLibrary}
          className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover}`}
        >
          Share My Schedule-Library
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={sharedLink}
          onChange={(e) => setSharedLink(e.target.value)}
          placeholder="Enter shared library link"
          className={`border rounded p-2 w-full ${theme.input}`}
        />
        <button
          onClick={handleLoadSharedLibrary}
          className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover} mt-2`}
        >
          Load Shared Library
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search public libraries"
          className={`border rounded p-2 w-full ${theme.input}`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {publicLibraries.map((library) => (
          <div key={library.id} className={`${theme.card} p-2 rounded`}>
            <h3 className={`${theme.text} font-semibold`}>{library.name}</h3>
            <button
              onClick={() => handleMergeLibrary(library.id)}
              className={`${theme.accent} ${theme.text} px-2 py-1 rounded ${theme.hover} mt-2 text-sm`}
            >
              Merge Emoji Library
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600`}
        >
          Reset Library
        </button>
      </div>
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
