import React from 'react';
import { useTheme } from '../themes';

const HelpModal = ({ onClose }) => {
  const { theme } = useTheme();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
      <div className={`${theme.card} p-6 rounded-lg max-w-lg`}>
        <h2 className={`text-2xl font-bold mb-4 ${theme.text}`}>How Sharing Works</h2>
        <p className={`mb-4 ${theme.text}`}>
          JSUsCH²R allows you to create and share emoji libraries and schedules. Here's how it works:
        </p>
        <ul className={`list-disc list-inside mb-4 ${theme.text}`}>
          <li>Anyone can browse public libraries and schedules without registering.</li>
          <li>To save and share your own libraries and schedules, you need to register an account.</li>
          <li>Registered users can set their libraries and schedules as public, private, or shared with specific users.</li>
          <li>Unregistered users can still create and use libraries and schedules locally, but cannot share them directly.</li>
        </ul>
        <button
          onClick={onClose}
          className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover}`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default HelpModal;
