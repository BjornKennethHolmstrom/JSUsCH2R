import React from 'react';
import { useTheme } from '../themes';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, message }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${theme.modalBackground} rounded-lg p-6 max-w-sm w-full`}>
        <p className={`${theme.text} mb-4`}>{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className={`${theme.text} px-4 py-2 rounded ${theme.hover}`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
