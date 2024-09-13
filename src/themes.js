import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
  bjorn: {
    name: 'BKH',
    background: 'bg-[#7FD4F5]',
    text: 'text-gray-800',
    card: 'bg-white',
    accent: 'bg-yellow-300',
    hover: 'hover:bg-blue-200',
    input: 'bg-white text-gray-800',
    emojiBg: 'bg-gray-200',
    dropdown: 'bg-white text-gray-800',
    modal: 'bg-white',
    modalBackground: 'bg-white',
  },
  dark: {
    name: 'Dark Mode',
    background: 'bg-[#2C3E50]',
    text: 'text-gray-200',
    card: 'bg-gray-800',
    accent: 'bg-yellow-600',
    hover: 'hover:bg-gray-700',
    input: 'bg-gray-700 text-gray-200',
    emojiBg: 'bg-gray-600',
    dropdown: 'bg-gray-700 text-gray-200',
    modal: 'bg-gray-800',
    modalBackground: 'bg-gray-800',
  },
  nature: {
    name: 'Nature',
    background: 'bg-[#4CAF50]',
    text: 'text-gray-900',
    card: 'bg-green-100',
    accent: 'bg-lime-300',
    hover: 'hover:bg-green-200',
    input: 'bg-white text-gray-900',
    emojiBg: 'bg-green-200',
    dropdown: 'bg-white text-gray-900',
    modal: 'bg-green-100',
    modalBackground: 'bg-green-100',
  },
  sunset: {
    name: 'Sunset',
    background: 'bg-[#FF7F50]',
    text: 'text-gray-900',
    card: 'bg-orange-100',
    accent: 'bg-pink-400',
    hover: 'hover:bg-orange-200',
    input: 'bg-white text-gray-900',
    emojiBg: 'bg-orange-200',
    dropdown: 'bg-white text-gray-900',
    modal: 'bg-orange-100',
    modalBackground: 'bg-orange-100',
  },
  ocean: {
    name: 'Ocean',
    background: 'bg-[#00CED1]',
    text: 'text-gray-900',
    card: 'bg-cyan-100',
    accent: 'bg-blue-400',
    hover: 'hover:bg-cyan-200',
    input: 'bg-white text-gray-900',
    emojiBg: 'bg-cyan-200',
    dropdown: 'bg-white text-gray-900',
    modal: 'bg-cyan-100',
    modalBackground: 'bg-cyan-100',
  },
  lavender: {
    name: 'Lavender',
    background: 'bg-[#E6E6FA]',
    text: 'text-gray-800',
    card: 'bg-purple-100',
    accent: 'bg-purple-300',
    hover: 'hover:bg-purple-200',
    input: 'bg-white text-gray-800',
    emojiBg: 'bg-purple-200',
    dropdown: 'bg-white text-gray-800',
    modal: 'bg-purple-100',
    modalBackground: 'bg-purple-100',
  },
  midnight: {
    name: 'Midnight',
    background: 'bg-[#191970]',
    text: 'text-gray-200',
    card: 'bg-indigo-900',
    accent: 'bg-indigo-400',
    hover: 'hover:bg-indigo-800',
    input: 'bg-indigo-800 text-gray-200',
    emojiBg: 'bg-indigo-700',
    dropdown: 'bg-indigo-800 text-gray-200',
    modal: 'bg-indigo-900',
    modalBackground: 'bg-indigo-900',
  },
  coffee: {
    name: 'Coffee',
    background: 'bg-[#6F4E37]',
    text: 'text-gray-200',
    card: 'bg-amber-900',
    accent: 'bg-amber-600',
    hover: 'hover:bg-amber-800',
    input: 'bg-amber-800 text-gray-200',
    emojiBg: 'bg-amber-700',
    dropdown: 'bg-amber-800 text-gray-200',
    modal: 'bg-amber-900',
    modalBackground: 'bg-amber-900',
  },
  pastel: {
    name: 'Pastel',
    background: 'bg-[#FFB6C1]',
    text: 'text-gray-800',
    card: 'bg-pink-100',
    accent: 'bg-yellow-200',
    hover: 'hover:bg-pink-200',
    input: 'bg-white text-gray-800',
    emojiBg: 'bg-pink-200',
    dropdown: 'bg-white text-gray-800',
    modal: 'bg-pink-100',
    modalBackground: 'bg-pink-100',
  },
  grayscale: {
    name: 'Grayscale',
    background: 'bg-gray-200',
    text: 'text-gray-800',
    card: 'bg-white',
    accent: 'bg-gray-600',
    hover: 'hover:bg-gray-300',
    input: 'bg-white text-gray-800',
    emojiBg: 'bg-gray-300',
    dropdown: 'bg-white text-gray-800',
    modal: 'bg-white',
    modalBackground: 'bg-white',
  },
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('jsusch2r-theme');
    return savedTheme && themes[savedTheme] ? savedTheme : 'bjorn';
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
