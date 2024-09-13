import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useTheme } from '../themes';
import { generateScheduleStats } from '../utils/scheduleStats';
import { COLORS } from '../colors';

const ShareModal = ({ weekSchedule, activeDay, timeAllocationData, onClose }) => {
  const { theme } = useTheme();
  const [shareMessage, setShareMessage] = useState("Check out my JSUsCH²R schedule!");
  const [shareImage, setShareImage] = useState('');
  const [shareMode, setShareMode] = useState('day');
  const [shareType, setShareType] = useState('schedule');
  const scheduleRef = useRef(null);

  useEffect(() => {
    generateShareableImage();
  }, [shareMode, shareType]);

  const generateShareableImage = async () => {
    if (scheduleRef.current) {
      const canvas = await html2canvas(scheduleRef.current, {
        scale: 2, // Increase resolution for sharper image
        backgroundColor: null, // Transparent background
      });
      setShareImage(canvas.toDataURL('image/png'));
    }
  };

  const handleShare = async () => {
    const stats = generateScheduleStats(shareMode === 'day' ? weekSchedule[activeDay] : Object.values(weekSchedule).flat());
    const shareData = {
      title: `My JSUsCH²R ${shareMode === 'day' ? 'Day' : 'Week'} ${shareType === 'schedule' ? 'Schedule' : 'Time Allocation'}`,
      text: `${shareMessage}\n\nStats:\n• Most frequent activity: ${stats.mostFrequentActivity.name} (${stats.mostFrequentActivity.hours} hours)\n• Unique activities: ${stats.uniqueActivities}\n• Productive hours: ${stats.productiveHours}\n• Sleep hours: ${stats.sleepHours}\n\nGet JSUsCH²R: https://github.com/BjornKennethHolmstrom/JSUsCH2R`,
    };

    if (shareImage) {
      const blob = await (await fetch(shareImage)).blob();
      const file = new File([blob], 'jsusch2r_share.png', { type: 'image/png' });
      shareData.files = [file];
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback for desktop or unsupported browsers
        const tempLink = document.createElement('a');
        tempLink.href = shareImage;
        tempLink.download = 'my_jsusch2r_share.png';
        tempLink.click();
        alert('Image downloaded. You can share it manually along with the following text:\n\n' + shareData.text);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getTimeAllocationData = () => {
    if (shareType === 'timeAllocation') {
      return shareMode === 'day' ? timeAllocationData.daily : timeAllocationData.weekly;
    }
    return null;
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
      <div className={`${theme.modalBackground} rounded-lg p-6 max-w-md w-full`}>
        <h2 className={`text-2xl font-semibold mb-4 ${theme.text}`}>Share Your JSUsCH²R Data</h2>
        
        <div className="mb-4">
          <label className={`block mb-2 ${theme.text}`}>Share Type:</label>
          <select
            value={shareType}
            onChange={(e) => setShareType(e.target.value)}
            className={`w-full p-2 border rounded ${theme.input} mb-2`}
          >
            <option value="schedule">Schedule</option>
            <option value="timeAllocation">Time Allocation Chart</option>
          </select>

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
          <h3 className={`text-lg font-semibold mb-2 ${theme.text}`}>
            My JSUsCH²R {shareType === 'schedule' ? (shareMode === 'day' ? 'Day' : 'Week') : 'Time Allocation'}
          </h3>
          {shareType === 'schedule' ? (
            shareMode === 'day' ? (
              <CompactDaySchedule schedule={weekSchedule[activeDay]} />
            ) : (
              <CompactWeekSchedule weekSchedule={weekSchedule} />
            )
          ) : (
            <TimeAllocationChart data={getTimeAllocationData()} />
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
          Share
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

const CompactDaySchedule = ({ schedule }) => (
  <div className="grid grid-cols-6 gap-1 text-xs">
    {schedule.map((item, index) => (
      <div key={index} className="flex flex-col items-center">
        <div className="text-lg">{item.emoji}</div>
        <div>{index % 3 === 0 ? `${index}:00` : ''}</div>
      </div>
    ))}
  </div>
);

const CompactWeekSchedule = ({ weekSchedule }) => (
  <div className="grid grid-cols-7 gap-1 text-xs">
    {Object.entries(weekSchedule).map(([day, schedule]) => (
      <div key={day} className="flex flex-col items-center">
        <div className="font-bold mb-1">{day}</div>
        {schedule.map((item, index) => (
          <div key={index} className="text-sm">
            {item.emoji}
          </div>
        ))}
      </div>
    ))}
  </div>
);

const TimeAllocationChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>No time allocation data available.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      {data.map((item, index) => (
        <div key={index} className="flex items-center">
          <div className="w-3 h-3 mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
          <span className="truncate">{item.name}: {item.value}h</span>
        </div>
      ))}
    </div>
  );
};

export default ShareModal;
