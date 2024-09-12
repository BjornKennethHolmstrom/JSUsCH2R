import React from 'react';
import { useTheme } from '../themes';

const EmojiLibraryHelpModal = ({ onClose }) => {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${theme.modal} rounded-lg p-6 max-w-md w-full`}>
        <h2 className={`text-2xl font-semibold mb-4 ${theme.text}`}>Emoji Library Help</h2>
        <div className={`${theme.text} mb-4`}>
          <h3 className="font-semibold mb-2">Using the Emoji Library:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>View available emojis and their associated activities</li>
            <li>Click on an emoji to use it in your schedule</li>
            <li>Add new emojis and activities to customize your library</li>
            <li>Remove emojis you don't need anymore</li>
          </ul>

          <h3 className="font-semibold mt-4 mb-2">Adding a New Emoji:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Type or paste an emoji in the "New emoji" field</li>
            <li>Enter a description for the activity in the "Activity description" field</li>
            <li>Click the "Add Emoji" button to add it to your library</li>
          </ol>

          <h3 className="font-semibold mt-4 mb-2">Removing an Emoji:</h3>
          <p>Click on the emoji you want to remove from the library</p>

          <h3 className="font-semibold mt-4 mb-2">Restoring Defaults:</h3>
          <p>Use the "Restore Defaults" button to reset your emoji library to the original set</p>
        </div>
        <button
          onClick={onClose}
          className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover} w-full`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default EmojiLibraryHelpModal;
