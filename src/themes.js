import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
  default: {
    name: 'Björn',
    background: 'bg-[#7FD4F5]',
    text: 'text-gray-800',
    card: 'bg-white',
    accent: 'bg-yellow-300',
    hover: 'hover:bg-blue-200',
  },
  dark: {
    name: 'Dark Mode',
    background: 'bg-[#2C3E50]',
    text: 'text-gray-200',
    card: 'bg-gray-800',
    accent: 'bg-yellow-600',
    hover: 'hover:bg-gray-700',
  },
  nature: {
    name: 'Nature',
    background: 'bg-[#4CAF50]',
    text: 'text-gray-900',
    card: 'bg-green-100',
    accent: 'bg-lime-300',
    hover: 'hover:bg-green-200',
  },
  sunset: {
    name: 'Sunset',
    background: 'bg-[#FF7F50]',
    text: 'text-gray-900',
    card: 'bg-orange-100',
    accent: 'bg-pink-400',
    hover: 'hover:bg-orange-200',
  },
  ocean: {
    name: 'Ocean',
    background: 'bg-[#00CED1]',
    text: 'text-gray-900',
    card: 'bg-cyan-100',
    accent: 'bg-blue-400',
    hover: 'hover:bg-cyan-200',
  },
  lavender: {
    name: 'Lavender',
    background: 'bg-[#E6E6FA]',
    text: 'text-gray-800',
    card: 'bg-purple-100',
    accent: 'bg-purple-300',
    hover: 'hover:bg-purple-200',
  },
  midnight: {
    name: 'Midnight',
    background: 'bg-[#191970]',
    text: 'text-gray-200',
    card: 'bg-indigo-900',
    accent: 'bg-indigo-400',
    hover: 'hover:bg-indigo-800',
  },
  coffee: {
    name: 'Coffee',
    background: 'bg-[#6F4E37]',
    text: 'text-gray-200',
    card: 'bg-amber-900',
    accent: 'bg-amber-600',
    hover: 'hover:bg-amber-800',
  },
  pastel: {
    name: 'Pastel',
    background: 'bg-[#FFB6C1]',
    text: 'text-gray-800',
    card: 'bg-pink-100',
    accent: 'bg-yellow-200',
    hover: 'hover:bg-pink-200',
  },
  grayscale: {
    name: 'Grayscale',
    background: 'bg-gray-200',
    text: 'text-gray-800',
    card: 'bg-white',
    accent: 'bg-gray-600',
    hover: 'hover:bg-gray-300',
  },
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('jsusch2r-theme');
    return savedTheme && themes[savedTheme] ? savedTheme : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('jsusch2r-theme', currentTheme);
  }, [currentTheme]);

  const theme = themes[currentTheme];

  return (
    <ThemeContext.Provider value={{ theme, setCurrentTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default themes;
