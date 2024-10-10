import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userId: null,
    token: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    if (token && storedUserId) {
      setAuthState({
        isAuthenticated: true,
        userId: storedUserId,
        token: token,
      });
    }
  }, []);

  const login = (token, userId) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    setAuthState({
      isAuthenticated: true,
      userId: userId,
      token: token,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setAuthState({
      isAuthenticated: false,
      userId: null,
      token: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const getAuthState = () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  return {
    isAuthenticated: !!token,
    userId,
    token,
  };
};
