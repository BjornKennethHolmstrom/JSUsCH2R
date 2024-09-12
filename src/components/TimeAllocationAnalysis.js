import React, { useState } from 'react';
import { useTheme } from '../themes';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
  '#F06292', '#AED581', '#7986CB', '#4DB6AC', '#FFF176', 
  '#FF8A65', '#A1887F', '#9575CD', '#4DD0E1', '#81C784', 
  '#FFB74D'
];

const TimeAllocationAnalysis = ({ weekSchedule, activeDay }) => {
  const { theme } = useTheme();
  const [analysisMode, setAnalysisMode] = useState('week');

  const analyzeSchedule = (schedule) => {
    const analysis = {};
    schedule.forEach(item => {
      if (analysis[item.activity]) {
        analysis[item.activity] += 1;
      } else {
        analysis[item.activity] = 1;
      }
    });

    return Object.entries(analysis).map(([activity, hours]) => ({
      name: activity,
      value: hours,
      percentage: (hours / (analysisMode === 'week' ? 168 : 24) * 100).toFixed(1)
    }));
  };

  const data = analysisMode === 'week' 
    ? analyzeSchedule(Object.values(weekSchedule).flat())
    : analyzeSchedule(weekSchedule[activeDay]);

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

  return (
    <div className={`mt-8 ${theme.card} rounded-lg shadow-lg p-6 max-w-2xl mx-auto`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-semibold ${theme.text}`}>Time Allocation Analysis</h2>
        <select
          value={analysisMode}
          onChange={(e) => setAnalysisMode(e.target.value)}
          className={`p-2 rounded ${theme.input}`}
        >
          <option value="week">Weekly</option>
          <option value="day">Daily</option>
        </select>
      </div>
      <div className="flex flex-col">
        <div className="w-full h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={100}
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
        <div className="w-full">
          <ul className={`${theme.text} grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2`}>
            {data.map((item, index) => (
              <li key={index} className="flex items-center">
                <span className="inline-block w-4 h-4 mr-2 flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="truncate">{item.name}: {item.value}h</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimeAllocationAnalysis;
