import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useTheme } from '../themes';
import { generateScheduleStats } from '../utils/scheduleStats';

// Unicode-safe encoding function
const encodeString = (str) => {
  return encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1));
};

const ShareModal = ({ schedule, onClose }) => {
  const { theme } = useTheme();
  const [shareMessage, setShareMessage] = useState("Check out my JSUsCH²R schedule!");
  const [shareUrl, setShareUrl] = useState('');
  const [shareImage, setShareImage] = useState('');
  const scheduleRef = useRef(null);
  const stats = generateScheduleStats(schedule);

  useEffect(() => {
    generateShareableUrl();
    generateShareableImage();
  }, []);

  const generateShareableUrl = () => {
    const encodedSchedule = btoa(encodeString(JSON.stringify(schedule)));
    const url = `${window.location.origin}${window.location.pathname}#schedule=${encodedSchedule}`;
    setShareUrl(url);
  };

  const generateShareableImage = async () => {
    if (scheduleRef.current) {
      const canvas = await html2canvas(scheduleRef.current);
      setShareImage(canvas.toDataURL());
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'My JSUsCH²R Schedule',
      text: `${shareMessage}\n\nStats:\n• Most frequent activity: ${stats.mostFrequentActivity.name} (${stats.mostFrequentActivity.hours} hours)\n• Unique activities: ${stats.uniqueActivities}\n• Productive hours: ${stats.productiveHours}\n• Sleep hours: ${stats.sleepHours}\n\nView my schedule: ${shareUrl}`,
      url: shareUrl,
    };

    if (shareImage && navigator.canShare && navigator.canShare({ files: [new File([shareImage], 'schedule.png', { type: 'image/png' })] })) {
      shareData.files = [new File([shareImage], 'schedule.png', { type: 'image/png' })];
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for desktop or unsupported browsers
        navigator.clipboard.writeText(shareData.text);
        alert('Share info copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50`}>
      <div className={`${theme.card} rounded-lg p-6 max-w-md w-full`}>
        <h2 className={`text-2xl font-semibold mb-4 ${theme.text}`}>Share Your Schedule</h2>
        
        <div ref={scheduleRef} className="bg-white p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold mb-2">My JSUsCH²R Schedule</h3>
          <div className="grid grid-cols-6 gap-1">
            {schedule.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl">{item.emoji}</div>
                <div className="text-xs">{index.toString().padStart(2, '0')}:00</div>
              </div>
            ))}
          </div>
        </div>

        <textarea
          value={shareMessage}
          onChange={(e) => setShareMessage(e.target.value)}
          className={`w-full p-2 border rounded mb-4 ${theme.text}`}
          rows="3"
        />

        <div className={`mb-4 ${theme.text}`}>
          <h4 className="font-semibold">Schedule Stats:</h4>
          <ul className="list-disc list-inside">
            <li>Most frequent activity: {stats.mostFrequentActivity.name} ({stats.mostFrequentActivity.hours} hours)</li>
            <li>Unique activities: {stats.uniqueActivities}</li>
            <li>Productive hours: {stats.productiveHours}</li>
            <li>Sleep hours: {stats.sleepHours}</li>
          </ul>
        </div>

        <button
          onClick={handleShare}
          className={`${theme.accent} ${theme.text} px-4 py-2 rounded ${theme.hover} w-full mb-4`}
        >
          Share Schedule
        </button>

        <button
          onClick={onClose}
          className={`${theme.text} px-4 py-2 rounded ${theme.hover} w-full border`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
