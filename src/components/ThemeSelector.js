import React from 'react';
import { useTheme } from '../themes';

const ThemeSelector = () => {
  const { theme, setCurrentTheme, themes } = useTheme();

  return (
    <div className="mb-4">
      <select
        value={Object.keys(themes).find(key => themes[key] === theme)}
        onChange={(e) => setCurrentTheme(e.target.value)}
        className="p-2 rounded bg-white text-gray-800"
      >
        {Object.entries(themes).map(([key, themeOption]) => (
          <option key={key} value={key}>
            {themeOption.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSelector;
