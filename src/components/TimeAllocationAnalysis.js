import React, { useState } from 'react';
import { useTheme } from '../themes';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
  '#F06292', '#AED581', '#7986CB', '#4DB6AC', '#FFF176', 
  '#FF8A65', '#A1887F', '#9575CD', '#4DD0E1', '#81C784', 
  '#FFB74D'
];

const TimeAllocationAnalysis = ({ schedule }) => {
  const { theme } = useTheme();
  const [showTime, setShowTime] = useState(true);
  const [showPercentage, setShowPercentage] = useState(true);

  const analyzeSchedule = () => {
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
      percentage: (hours / 24 * 100).toFixed(1)
    }));
  };

  const data = analyzeSchedule();

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    let label = name;
    if (showTime) label += ` (${value}h)`;
    if (showPercentage) label += ` ${(percent * 100).toFixed(1)}%`;

    return (
      <text x={x} y={y} fill={COLORS[index % COLORS.length]} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {label}
      </text>
    );
  };

  return (
    <div className={`mt-8 ${theme.card} rounded-lg shadow-lg p-6 max-w-2xl mx-auto`}>
      <h2 className={`text-2xl font-semibold mb-4 ${theme.text}`}>Time Allocation Analysis</h2>
      <div className="flex justify-center space-x-4 mb-4">
        <label className={`flex items-center ${theme.text}`}>
          <input
            type="checkbox"
            checked={showTime}
            onChange={() => setShowTime(!showTime)}
            className="mr-2"
          />
          Show time
        </label>
        <label className={`flex items-center ${theme.text}`}>
          <input
            type="checkbox"
            checked={showPercentage}
            onChange={() => setShowPercentage(!showPercentage)}
            className="mr-2"
          />
          Show %
        </label>
      </div>
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => {
                let result = [];
                if (showTime) result.push(`${value} hours`);
                if (showPercentage) result.push(`${props.payload.percentage}%`);
                return [result.join(' - '), name];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TimeAllocationAnalysis;
