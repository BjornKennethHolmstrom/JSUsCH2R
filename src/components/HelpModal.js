import React from 'react';
import { useTheme } from '../themes';

const HelpModal = ({ onClose }) => {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${theme.modal} rounded-lg p-6 max-w-md w-full`}>
        <h2 className={`text-2xl font-semibold mb-4 ${theme.text}`}>Help</h2>
        <div className={`${theme.text} mb-4`}>
          <h3 className="font-semibold mb-2">Desktop Users:</h3>
          <p>Click the "Show Time Labels" button to display or hide time information for each emoji.</p>
          <h3 className="font-semibold mt-4 mb-2">Mobile Users:</h3>
          <p>Swipe left on the schedule to show time labels. Swipe right to hide them.</p>
          <h3 className="font-semibold mt-4 mb-2">General Usage:</h3>
          <ul className="list-disc list-inside">
            <li>Click on an emoji to edit the activity</li>
            <li>Use the day buttons at the top to switch between days</li>
            <li>The current time's emoji is highlighted</li>
          </ul>
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

export default HelpModal;
