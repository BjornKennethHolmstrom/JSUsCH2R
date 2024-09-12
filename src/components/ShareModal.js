import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useTheme } from '../themes';
import { generateScheduleStats } from '../utils/scheduleStats';

const ShareModal = ({ weekSchedule, activeDay, onClose }) => {
  const { theme } = useTheme();
  const [shareMessage, setShareMessage] = useState("Check out my JSUsCH²R schedule!");
  const [shareImage, setShareImage] = useState('');
  const [shareMode, setShareMode] = useState('day');
  const scheduleRef = useRef(null);

  useEffect(() => {
    generateShareableImage();
  }, [shareMode]);

  const generateShareableImage = async () => {
    if (scheduleRef.current) {
      const canvas = await html2canvas(scheduleRef.current);
      setShareImage(canvas.toDataURL('image/png'));
    }
  };

  const handleShare = async () => {
    const stats = generateScheduleStats(shareMode === 'day' ? weekSchedule[activeDay] : Object.values(weekSchedule).flat());
    const shareData = {
      title: `My JSUsCH²R ${shareMode === 'day' ? 'Day' : 'Week'} Schedule`,
      text: `${shareMessage}\n\nStats:\n• Most frequent activity: ${stats.mostFrequentActivity.name} (${stats.mostFrequentActivity.hours} hours)\n• Unique activities: ${stats.uniqueActivities}\n• Productive hours: ${stats.productiveHours}\n• Sleep hours: ${stats.sleepHours}\n\nGet JSUsCH²R: https://github.com/bjornkj/JSUsCH2R`,
    };

    if (shareImage) {
      const blob = await (await fetch(shareImage)).blob();
      const file = new File([blob], 'schedule.png', { type: 'image/png' });
      shareData.files = [file];
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback for desktop or unsupported browsers
        const tempLink = document.createElement('a');
        tempLink.href = shareImage;
        tempLink.download = 'my_jsusch2r_schedule.png';
        tempLink.click();
        alert('Image downloaded. You can share it manually along with the following text:\n\n' + shareData.text);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
      <div className={`${theme.modalBackground} rounded-lg p-6 max-w-md w-full`}>
        <h2 className={`text-2xl font-semibold mb-4 ${theme.text}`}>Share Your Schedule</h2>
        
        <div className="mb-4">
          <label className={`block mb-2 ${theme.text}`}>Share Mode:</label>
          <select
            value={shareMode}
            onChange={(e) => setShareMode(e.target.value)}
            className={`w-full p-2 border rounded ${theme.input}`}
          >
            <option value="day">Current Day</option>
            <option value="week">Entire Week</option>
          </select>
        </div>

        <div ref={scheduleRef} className={`${theme.card} p-4 rounded-lg mb-4`}>
          <h3 className={`text-lg font-semibold mb-2 ${theme.text}`}>My JSUsCH²R {shareMode === 'day' ? 'Day' : 'Week'} Schedule</h3>
          {shareMode === 'day' ? (
            <DaySchedule schedule={weekSchedule[activeDay]} />
          ) : (
            <WeekSchedule weekSchedule={weekSchedule} />
          )}
        </div>

        <textarea
          value={shareMessage}
          onChange={(e) => setShareMessage(e.target.value)}
          className={`w-full p-2 border rounded mb-4 ${theme.input}`}
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
