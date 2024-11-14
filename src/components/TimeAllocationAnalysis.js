import React, { useState } from 'react';
import { useTheme } from '../themes';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../colors';

const TimeAllocationAnalysis = ({ weekSchedule, activeDay, onShare }) => {
  const { theme } = useTheme();
  const [analysisMode, setAnalysisMode] = useState('week');

  const analyzeSchedule = (schedule) => {
    // Ensure schedule is valid and has items
    if (!schedule || !Array.isArray(schedule)) {
      console.log('Invalid schedule:', schedule);
      return [];
    }

    const analysis = {};
    schedule.forEach(item => {
      // Skip invalid items
      if (!item || typeof item !== 'object' || !item.activity) {
        console.log('Invalid schedule item:', item);
        return;
      }

      analysis[item.activity] = (analysis[item.activity] || 0) + 1;
    });

    return Object.entries(analysis).map(([activity, hours]) => ({
      name: activity,
      value: hours,
      percentage: (hours / (analysisMode === 'week' ? 168 : 24) * 100).toFixed(1)
    }));
  };

  // Safely get the data for analysis
  const getData = () => {
    try {
      if (analysisMode === 'week') {
        // Ensure weekSchedule is an object with valid days
        if (!weekSchedule || typeof weekSchedule !== 'object') {
          console.log('Invalid week schedule:', weekSchedule);
          return [];
        }
        
        // Flatten all days into a single array
        const allDayItems = Object.values(weekSchedule)
          .filter(day => Array.isArray(day))
          .flat();
          
        return analyzeSchedule(allDayItems);
      } else {
        // For daily analysis
        const daySchedule = weekSchedule[activeDay];
        if (!Array.isArray(daySchedule)) {
          console.log('Invalid day schedule:', daySchedule);
          return [];
        }
        return analyzeSchedule(daySchedule);
      }
    } catch (error) {
      console.error('Error analyzing schedule:', error);
      return [];
    }
  };

  const data = getData();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`${theme.modalBackground} p-2 rounded shadow`}>
          <p className={`${theme.text} font-semibold`}>{data.name}</p>
          <p className={theme.text}>{data.value} hours ({data.percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  // If no data is available, show a message
  if (!data || data.length === 0) {
    return (
      <div className={`mt-12 ${theme.card} rounded-lg shadow-lg p-6 max-w-2xl mx-auto`}>
        <div className="text-center">
          <h2 className={`text-2xl font-semibold ${theme.text} mb-4`}>Time Allocation Analysis</h2>
          <p className={theme.text}>No data available for analysis. Please ensure your schedule has activities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-12 ${theme.card} rounded-lg shadow-lg p-6 max-w-2xl mx-auto`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-semibold ${theme.text}`}>Time Allocation Analysis</h2>
        <div className="flex items-center">
          <select
            value={analysisMode}
            onChange={(e) => setAnalysisMode(e.target.value)}
            className={`p-2 rounded ${theme.input} mr-2`}
          >
            <option value="week">Weekly</option>
            <option value="day">Daily</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="w-full h-80 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percentage }) => `${name} ${percentage}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full mt-4">
          <ul className={`${theme.text} grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4`}>
            {data.map((item, index) => (
              <li key={index} className="flex items-center">
                <span 
                  className="inline-block w-4 h-4 mr-2 flex-shrink-0" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="truncate">
                  {item.name}: {item.value}h
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimeAllocationAnalysis;
