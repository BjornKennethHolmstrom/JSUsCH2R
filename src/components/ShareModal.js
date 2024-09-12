import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useTheme } from '../themes';
import { generateScheduleStats } from '../utils/scheduleStats';

const ShareModal = ({ weekSchedule, activeDay, onClose }) => {
  const { theme } = useTheme();
  const [shareMessage, setShareMessage] = useState("Check out my JSUsCH²R schedule!");
  const [shareUrl, setShareUrl] = useState('');
  const [shareImage, setShareImage] = useState('');
  const [shareMode, setShareMode] = useState('day'); // 'day' or 'week'
  const scheduleRef = useRef(null);

  useEffect(() => {
    generateShareableUrl();
    generateShareableImage();
  }, [shareMode]);

  const generateShareableUrl = () => {
    const scheduleToShare = shareMode === 'day' ? weekSchedule[activeDay] : weekSchedule;
    const encodedSchedule = btoa(encodeURIComponent(JSON.stringify(scheduleToShare)));
    const url = `${window.location.origin}${window.location.pathname}#schedule=${encodedSchedule}&mode=${shareMode}`;
    setShareUrl(url);
  };

  const generateShareableImage = async () => {
    if (scheduleRef.current) {
      const canvas = await html2canvas(scheduleRef.current);
      setShareImage(canvas.toDataURL());
    }
  };

  const handleShare = async () => {
    const stats = generateScheduleStats(shareMode === 'day' ? weekSchedule[activeDay] : Object.values(weekSchedule).flat());
    const shareData = {
      title: `My JSUsCH²R ${shareMode === 'day' ? 'Day' : 'Week'} Schedule`,
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
        
        <div className="mb-4">
          <label className={`block mb-2 ${theme.text}`}>Share Mode:</label>
          <select
            value={shareMode}
            onChange={(e) => setShareMode(e.target.value)}
            className={`w-full p-2 border rounded ${theme.text}`}
          >
            <option value="day">Current Day</option>
            <option value="week">Entire Week</option>
          </select>
        </div>

        <div ref={scheduleRef} className="bg-white p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold mb-2">My JSUsCH²R {shareMode === 'day' ? 'Day' : 'Week'} Schedule</h3>
          {shareMode === 'day' ? (
            <DaySchedule schedule={weekSchedule[activeDay]} />
          ) : (
            <WeekSchedule weekSchedule={weekSchedule} />
          )}
        </div>

        <textarea
          value={shareMessage}
          onChange={(e) => setShareMessage(e.target.value)}
          className={`w-full p-2 border rounded mb-4 ${theme.text}`}
          rows="3"
        />

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

const DaySchedule = ({ schedule }) => (
  <div className="grid grid-cols-6 gap-1">
    {schedule.map((item, index) => (
      <div key={index} className="text-center">
        <div className="text-2xl">{item.emoji}</div>
        <div className="text-xs">{index.toString().padStart(2, '0')}:00</div>
      </div>
    ))}
  </div>
);

const WeekSchedule = ({ weekSchedule }) => (
  <div className="space-y-2">
    {Object.entries(weekSchedule).map(([day, schedule]) => (
      <div key={day} className="flex items-center">
        <div className="w-10 font-bold">{day}</div>
        <div className="flex-1 overflow-x-auto">
          <div className="flex">
            {schedule.map((item, index) => (
              <div key={index} className="text-center mx-1">
                <div className="text-lg">{item.emoji}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default ShareModal;
